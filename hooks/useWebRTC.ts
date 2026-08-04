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
  shareMotion: (motion: string, roomId: string) => void;
  shareCoinToss: (result: any, roomId: string) => void;
  sendTurnChange: (turn: string, roomId: string) => void;
  onMotionShared: (callback: (motion: string) => void) => void;
  onCoinTossShared: (callback: (result: any) => void) => void;
  onTurnChanged: (callback: (turn: string) => void) => void;
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
      setError('Connection error. Attempting to reconnect...');
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketRef.current.on('reconnect', () => {
      console.log('🔄 Socket reconnected');
      setError(null);
      if (roomId) {
        socketRef.current?.emit('join-room', roomId);
      }
    });

    socketRef.current.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    socketRef.current.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
      setError('Failed to reconnect. Please refresh the page.');
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

    // Handle shared motion event
    socketRef.current.on('motion-shared', (data: { motion: string }) => {
      console.log('📜 Received motion-shared event:', data.motion);
    });

    // Handle shared coin toss event
    socketRef.current.on('coin-toss-shared', (data: { result: any }) => {
      console.log('🪙 Received coin-toss-shared event:', data.result);
    });

    // Handle turn change event
    socketRef.current.on('turn-changed', (data: { turn: string }) => {
      console.log('🔄 Received turn-changed event:', data.turn);
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
      // Clean up existing peer if any
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }

      setIsConnecting(true);
      setError(null);

      console.log('🔧 Initializing peer connection as:', initiator ? 'initiator' : 'receiver');

      // Get local media stream if not already initialized
      let stream = localStreamRef.current;
      if (!stream) {
        console.log('🎤 Initializing media stream...');
        stream = await initializeMedia();
      }

      // Create WebRTC peer connection with better configuration
      const peer = new SimplePeer({
        initiator,
        trickle: false,
        stream: stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
          ]
        },
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
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
        
        // Clean up on error
        if (peerRef.current) {
          peerRef.current.destroy();
          peerRef.current = null;
        }
      });

      peer.on('close', () => {
        console.log('🔌 Peer connection closed');
        setIsConnected(false);
        setRemoteStream(null);
        
        // Clean up on close
        if (peerRef.current) {
          peerRef.current.destroy();
          peerRef.current = null;
        }
      });

      // If we have an initial signal, process it
      if (initialSignal) {
        console.log('📡 Processing initial signal');
        peer.signal(initialSignal);
      }

    } catch (err) {
      console.error('❌ Error initializing peer:', err);
      setError('Connection failed. Please try again.');
      setIsConnecting(false);
    }
  };

  const joinRoom = useCallback((roomToJoin: string) => {
    console.log('🏠 Joining room:', roomToJoin);
    if (socketRef.current) {
      // Ensure socket is connected before joining room
      if (socketRef.current.connected) {
        socketRef.current.emit('join-room', roomToJoin);
      } else {
        console.log('⏳ Socket not connected yet, waiting...');
        socketRef.current.on('connect', () => {
          console.log('✓ Socket connected, joining room:', roomToJoin);
          socketRef.current?.emit('join-room', roomToJoin);
        });
      }
    }
  }, []);

  const shareMotion = useCallback((motion: string, roomId: string) => {
    console.log('📜 Sharing motion:', motion);
    if (socketRef.current) {
      socketRef.current.emit('share-motion', { motion, roomId });
    }
  }, []);

  const shareCoinToss = useCallback((result: any, roomId: string) => {
    console.log('🪙 Sharing coin toss:', result);
    if (socketRef.current) {
      socketRef.current.emit('share-coin-toss', { result, roomId });
    }
  }, []);

  const sendTurnChange = useCallback((turn: string, roomId: string) => {
    console.log('🔄 Sending turn change:', turn);
    if (socketRef.current) {
      socketRef.current.emit('turn-change', { turn, roomId });
    }
  }, []);

  const onMotionShared = useCallback((callback: (motion: string) => void) => {
    if (socketRef.current) {
      // Remove any existing listener to prevent duplicates
      socketRef.current.off('motion-shared');
      socketRef.current.on('motion-shared', callback);
    }
  }, []);

  const onCoinTossShared = useCallback((callback: (result: any) => void) => {
    if (socketRef.current) {
      // Remove any existing listener to prevent duplicates
      socketRef.current.off('coin-toss-shared');
      socketRef.current.on('coin-toss-shared', callback);
    }
  }, []);

  const onTurnChanged = useCallback((callback: (turn: string) => void) => {
    if (socketRef.current) {
      // Remove any existing listener to prevent duplicates
      socketRef.current.off('turn-changed');
      socketRef.current.on('turn-changed', callback);
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
    shareMotion,
    shareCoinToss,
    sendTurnChange,
    onMotionShared,
    onCoinTossShared,
    onTurnChanged,
    error,
  };
};