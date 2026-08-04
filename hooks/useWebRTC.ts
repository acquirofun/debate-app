import { useEffect, useRef, useState, useCallback } from 'react';
import SimplePeer from 'simple-peer';
import { io, Socket } from 'socket.io-client';

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnecting: boolean;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  startCall: () => void;
  initializeMedia: () => Promise<MediaStream>;
  error: string | null;
}

export const useWebRTC = (roomId: string | null): UseWebRTCReturn => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isInitiatorRef = useRef(false);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:3000';
    
    console.log('Connecting to socket server at:', socketUrl);
    
    // Close existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    socketRef.current = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log('✓ Connected to signaling server with ID:', socketRef.current?.id);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to server. Please refresh the page.');
    });

    socketRef.current.on('user-connected', async (userId: string) => {
      console.log('📞 User connected:', userId);
      // Don't automatically start call - let user manually initiate
      // This gives users more control and better error handling
    });

    socketRef.current.on('signal', async (data: { signal: any; userId: string }) => {
      console.log('📡 Received signal from:', data.userId);
      
      if (!peerRef.current) {
        // Create peer as receiver if we don't have one yet
        console.log('🎯 Creating peer as receiver');
        await initializePeer(false, data.signal);
      } else if (peerRef.current) {
        console.log('📡 Processing signal');
        peerRef.current.signal(data.signal);
      }
    });

    socketRef.current.on('user-disconnected', () => {
      console.log('👋 User disconnected');
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      setIsConnected(false);
      setRemoteStream(null);
      isInitiatorRef.current = false;
    });

    return () => {
      console.log('🧹 Cleaning up WebRTC resources');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [roomId]);

  const initializeMedia = async () => {
    try {
      console.log('🎤 Requesting camera and microphone access...');
      setError(null);

      // Stop existing stream if any
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      // Check if media devices are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support media devices. Please use Chrome or Firefox.');
      }

      // Request media access with optimized settings
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        },
      });

      console.log('✓ Camera and microphone access granted');
      console.log('📹 Video tracks:', stream.getVideoTracks().length);
      console.log('🎤 Audio tracks:', stream.getAudioTracks().length);

      // Set up track event listeners to prevent buffering
      stream.getTracks().forEach(track => {
        track.onended = () => {
          console.log(`Track ${track.kind} ended`);
        };
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      return stream;
    } catch (err: any) {
      console.error('❌ Error accessing media devices:', err);
      
      let errorMessage = 'Could not access camera/microphone. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera and microphone permissions in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found. Please connect a device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera or microphone is already in use by another application.';
      } else {
        errorMessage += `Error: ${err.message || 'Unknown error'}`;
      }
      
      setError(errorMessage);
      throw err;
    }
  };

  const initializePeer = async (initiator: boolean, initialSignal?: any) => {
    try {
      setIsConnecting(true);
      setError(null);

      console.log('🔧 Initializing peer connection as:', initiator ? 'initiator' : 'receiver');

      // Get local media stream if not already initialized
      let stream = localStreamRef.current;
      if (!stream) {
        console.log('🎤 Initializing media stream...');
        stream = await initializeMedia();
      }

      // Create WebRTC peer connection
      const peer = new SimplePeer({
        initiator,
        trickle: false,
        stream: stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ]
        }
      });

      peerRef.current = peer;

      peer.on('signal', (signal) => {
        console.log('📡 Sending signal');
        if (socketRef.current && roomId) {
          socketRef.current.emit('signal', {
            roomId,
            signal,
            userId: socketRef.current.id,
          });
        }
      });

      peer.on('stream', (remoteStream) => {
        console.log('📹 Received remote stream');
        console.log('📹 Remote video tracks:', remoteStream.getVideoTracks().length);
        console.log('🎤 Remote audio tracks:', remoteStream.getAudioTracks().length);
        
        // Set up remote stream track listeners
        remoteStream.getTracks().forEach(track => {
          track.onended = () => {
            console.log(`Remote track ${track.kind} ended`);
          };
        });
        
        setRemoteStream(remoteStream);
        setIsConnected(true);
        setIsConnecting(false);
      });

      peer.on('connect', () => {
        console.log('✅ Peer connection established');
        setIsConnected(true);
        setIsConnecting(false);
      });

      peer.on('error', (err) => {
        console.error('❌ Peer connection error:', err);
        setError('Connection failed. Please try again.');
        setIsConnecting(false);
      });

      peer.on('close', () => {
        console.log('🔌 Peer connection closed');
        setIsConnected(false);
        setRemoteStream(null);
      });

      // If we have an initial signal, process it
      if (initialSignal) {
        console.log('📡 Processing initial signal');
        peer.signal(initialSignal);
      }

    } catch (err) {
      console.error('❌ Error initializing peer:', err);
      setIsConnecting(false);
    }
  };

  const joinRoom = useCallback((roomToJoin: string) => {
    console.log('🏠 Joining room:', roomToJoin);
    if (socketRef.current) {
      socketRef.current.emit('join-room', roomToJoin);
    }
  }, []);

  const startCall = async () => {
    console.log('📞 Starting call as initiator...');
    isInitiatorRef.current = true;
    await initializePeer(true);
  };

  return {
    localStream,
    remoteStream,
    isConnecting,
    isConnected,
    joinRoom,
    startCall,
    initializeMedia,
    error,
  };
};