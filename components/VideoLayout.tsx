'use client';

import { useEffect, useRef, useState } from 'react';
import { useAudioLevel } from '@/hooks/useAudioLevel';

interface VideoLayoutProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export default function VideoLayout({
  localStream,
  remoteStream,
  isConnected,
  isConnecting,
  error,
}: VideoLayoutProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isRemoteAudioEnabled, setIsRemoteAudioEnabled] = useState(true);

  // Audio level detection
  const localAudioLevel = useAudioLevel(localStream, isAudioEnabled);
  const remoteAudioLevel = useAudioLevel(remoteStream, isRemoteAudioEnabled);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      // Only update if the stream is actually different
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
        // Don't auto-play to prevent interruption errors
        // Video will play when loaded
      }
      
      // Initialize state based on actual track status
      const audioTrack = localStream.getAudioTracks()[0];
      const videoTrack = localStream.getVideoTracks()[0];
      if (audioTrack) {
        setIsAudioEnabled(audioTrack.enabled);
      }
      if (videoTrack) {
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      // Only update if the stream is actually different
      if (remoteVideoRef.current.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        // Force play to ensure audio is ready
        remoteVideoRef.current.play().catch(e => console.error('Error playing remote video:', e));
        // Small delay to ensure audio is ready
        setTimeout(() => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.muted = false;
            setIsRemoteAudioEnabled(true);
            console.log('Remote audio initialized: unmuted');
          }
        }, 100);
      }
    }
  }, [remoteStream]);

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        const newState = !audioTrack.enabled;
        audioTrack.enabled = newState;
        setIsAudioEnabled(newState);
        console.log('Audio toggled:', newState ? 'enabled' : 'disabled');
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        const newState = !videoTrack.enabled;
        videoTrack.enabled = newState;
        setIsVideoEnabled(newState);
        console.log('Video toggled:', newState ? 'enabled' : 'disabled');
      }
    }
  };

  const toggleRemoteAudio = () => {
    if (remoteVideoRef.current) {
      const newState = !isRemoteAudioEnabled;
      remoteVideoRef.current.muted = !newState;
      setIsRemoteAudioEnabled(newState);
      console.log('Remote audio toggled:', newState ? 'enabled' : 'disabled');
      console.log('Video muted state:', remoteVideoRef.current.muted);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg text-center mb-4">
          {error}
        </div>
      )}

      <div className="flex-1 grid grid-cols-2 gap-4 min-h-[400px] relative">
        {/* Local Video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror effect
          />
          
          {/* Avatar when video is off */}
          {localStream && !isVideoEnabled && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">👤</span>
                </div>
                <p className="text-xl font-semibold">You</p>
              </div>
            </div>
          )}

          {/* Name label with audio level */}
          <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
            <span>You</span>
            {isAudioEnabled && localAudioLevel > 0.05 && (
              <div className="flex gap-0.5 items-end h-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-green-500 rounded-full transition-all"
                    style={{
                      height: `${Math.max(2, localAudioLevel * 12 * (i + 1) * 0.3)}px`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Audio indicator */}
          {localStream && !isAudioEnabled && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              🔇 Muted
            </div>
          )}
          
          {!localStream && (
            <div className="text-white text-center">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎤</span>
              </div>
              <p className="text-lg font-medium">Camera not enabled</p>
              <p className="text-sm text-gray-400 mt-2">Click "Enable Camera & Microphone" button</p>
            </div>
          )}
        </div>

        {/* Remote Video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className="w-full h-full object-cover"
          />
          
          {/* Avatar when no remote stream */}
          {!remoteStream && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">�</span>
                </div>
                {isConnecting ? (
                  <p className="text-lg font-medium">🔄 Connecting...</p>
                ) : isConnected ? (
                  <p className="text-lg font-medium">⏳ Waiting for video...</p>
                ) : (
                  <p className="text-lg font-medium">👋 Waiting to join...</p>
                )}
              </div>
            </div>
          )}

          {/* Name label with audio level */}
          <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
            <span>Opponent</span>
            {isRemoteAudioEnabled && remoteAudioLevel > 0.05 && (
              <div className="flex gap-0.5 items-end h-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-blue-500 rounded-full transition-all"
                    style={{
                      height: `${Math.max(2, remoteAudioLevel * 12 * (i + 1) * 0.3)}px`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Remote audio indicator */}
          {remoteStream && !isRemoteAudioEnabled && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              🔇 Muted
            </div>
          )}
        </div>

        {/* Zoom-style Control Bar */}
        {localStream && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl border border-gray-700">
            {/* Mute/Unmute with Audio Level Indicator */}
            <div className="relative">
              {/* Audio Level Ring */}
              {isAudioEnabled && localAudioLevel > 0.05 && (
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(
                      #22c55e 0deg ${localAudioLevel * 360}deg,
                      transparent ${localAudioLevel * 360}deg 360deg
                    )`,
                    padding: '2px',
                  }}
                >
                  <div className="w-full h-full rounded-full bg-gray-700" />
                </div>
              )}
              
              <button
                onClick={toggleAudio}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative z-10 ${
                  isAudioEnabled 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title={isAudioEnabled ? 'Mute' : 'Unmute'}
              >
                {isAudioEnabled ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
              </button>
            </div>

            {/* Video On/Off */}
            <button
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isVideoEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={isVideoEnabled ? 'Stop Video' : 'Start Video'}
            >
              {isVideoEnabled ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )}
            </button>

            {/* Connection Status */}
            <div className="px-4 py-2 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-white text-sm font-medium">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
            </div>

            {/* Remote Audio Toggle with Audio Level Indicator */}
            {remoteStream && (
              <div className="relative">
                {/* Audio Level Ring */}
                {isRemoteAudioEnabled && remoteAudioLevel > 0.05 && (
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(
                        #3b82f6 0deg ${remoteAudioLevel * 360}deg,
                        transparent ${remoteAudioLevel * 360}deg 360deg
                      )`,
                      padding: '2px',
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-gray-700" />
                  </div>
                )}
                
                <button
                  onClick={toggleRemoteAudio}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative z-10 ${
                    isRemoteAudioEnabled 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  title={isRemoteAudioEnabled ? 'Mute Opponent' : 'Unmute Opponent'}
                >
                  {isRemoteAudioEnabled ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}