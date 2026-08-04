'use client';

import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg text-center">
          {error}
        </div>
      )}

      <div className="flex-1 grid grid-cols-2 gap-4 min-h-[400px]">
        {/* Local Video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
            You
          </div>
          {!localStream && (
            <div className="text-white text-center">
              <p className="text-lg">Waiting for camera...</p>
            </div>
          )}
        </div>

        {/* Remote Video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
            Opponent
          </div>
          {!remoteStream && (
            <div className="text-white text-center">
              {isConnecting ? (
                <p className="text-lg">Connecting...</p>
              ) : (
                <p className="text-lg">Waiting for opponent to join...</p>
              )}
            </div>
          )}
        </div>
      </div>

      {isConnected && (
        <div className="bg-green-500 text-white p-3 rounded-lg text-center">
          ✓ Connected
        </div>
      )}
    </div>
  );
}