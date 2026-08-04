import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { io, Socket } from 'socket.io-client';

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnecting: boolean;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  startCall: () => void;
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
    socketRef.current = io(socketUrl);

    socketRef.current.on('connect', () => {
      console.log('Connected to signaling server');
    });

    socketRef.current.on('user-connected', async (userId: string) => {
      console.log('User connected:', userId);
      if (roomId && !peerRef.current && !isInitiatorRef.current) {
        // First user to respond becomes initiator
        isInitiatorRef.current = true;
        await initializePeer(true);
      }
    });

    socketRef.current.on('signal', async (data: { signal: any; userId: string }) => {
      console.log('Received signal from:', data.userId);
      
      if (!peerRef.current && !isInitiatorRef.current) {
        // Create peer as receiver if we don't have one yet
        await initializePeer(false, data.signal);
      } else if (peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    });

    socketRef.current.on('user-disconnected', () => {
      console.log('User disconnected');
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      setIsConnected(false);
      setRemoteStream(null);
      isInitiatorRef.current = false;
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId]);

  const initializePeer = async (initiator: boolean, initialSignal?: any) => {
    try {
      setIsConnecting(true);
      setError(null);

      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);

      // Create WebRTC peer connection
      const peer = new SimplePeer({
        initiator,
        trickle: false,
        stream: stream,
      });

      peerRef.current = peer;

      peer.on('signal', (signal) => {
        console.log('Sending signal');
        if (socketRef.current && roomId) {
          socketRef.current.emit('signal', {
            roomId,
            signal,
            userId: socketRef.current.id,
          });
        }
      });

      peer.on('stream', (remoteStream) => {
        console.log('Received remote stream');
        setRemoteStream(remoteStream);
        setIsConnected(true);
        setIsConnecting(false);
      });

      peer.on('connect', () => {
        console.log('Peer connection established');
        setIsConnected(true);
        setIsConnecting(false);
      });

      peer.on('error', (err) => {
        console.error('Peer connection error:', err);
        setError('Connection failed. Please try again.');
        setIsConnecting(false);
      });

      peer.on('close', () => {
        console.log('Peer connection closed');
        setIsConnected(false);
        setRemoteStream(null);
      });

      // If we have an initial signal, process it
      if (initialSignal) {
        peer.signal(initialSignal);
      }

    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera/microphone. Please check permissions.');
      setIsConnecting(false);
    }
  };

  const joinRoom = (roomToJoin: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-room', roomToJoin);
    }
  };

  const startCall = async () => {
    await initializePeer(true);
  };

  return {
    localStream,
    remoteStream,
    isConnecting,
    isConnected,
    joinRoom,
    startCall,
    error,
  };
};