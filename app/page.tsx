'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');

  const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    router.push(`/debate/room/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      router.push(`/debate/room/${roomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            P2P Video Debate
          </h1>
          <p className="text-xl text-gray-400">
            Connect, Debate, and Let AI Judge
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="space-y-4">
            <button
              onClick={handleCreateRoom}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition transform hover:scale-105 text-lg"
            >
              Create New Room
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter Room Code"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-center text-2xl font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                maxLength={6}
              />
              <button
                onClick={handleJoinRoom}
                disabled={!roomId.trim()}
                className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3 px-6 rounded-lg transition text-lg"
              >
                Join Room
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-center">Features</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                AI-generated debate motions
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Automated coin toss for side assignment
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                P2P video calling with WebRTC
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Live speech-to-text transcript
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                AI-powered debate judge
              </li>
            </ul>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm">
          Share the room code with your opponent to start debating
        </p>
      </div>
    </div>
  );
}