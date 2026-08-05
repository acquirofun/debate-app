'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');

  const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '#DEBATE-';
    for (let i = 0; i < 4; i++) {
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b" style={{ borderColor: 'var(--surface-container)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center neon-glow" style={{ backgroundColor: 'var(--primary-dark)' }}>
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <h1 className="font-display font-bold text-xl">DebateP2P</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--secondary)' }}></div>
          <span className="font-mono-tech text-xs" style={{ color: 'var(--secondary)' }}>Server Online</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg w-full space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="font-display font-bold text-5xl tracking-tight" style={{ color: 'var(--primary)' }}>
              CONNECT. DEBATE. EVALUATE.
            </h2>
            <p className="text-lg" style={{ color: 'var(--on-surface-variant)' }}>
              The next-generation real-time P2P debating platform powered by AI
            </p>
          </div>

          {/* Form Card */}
          <div className="glass rounded-2xl p-8 space-y-6">
            <div className="space-y-4">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="font-mono-tech text-sm uppercase tracking-wider" style={{ color: 'var(--outline)' }}>
                  Enter Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g., Alex Mercer"
                  className="w-full px-4 py-3 rounded-lg font-sans text-lg focus:outline-none focus:ring-2 transition"
                  style={{
                    backgroundColor: 'var(--surface-container-low)',
                    border: '1px solid var(--outline-variant)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>

              {/* Room Code Input */}
              <div className="space-y-2">
                <label className="font-mono-tech text-sm uppercase tracking-wider" style={{ color: 'var(--outline)' }}>
                  Enter Room Code
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="e.g., #DEBATE-9921"
                  className="w-full px-4 py-3 rounded-lg font-mono-tech text-xl tracking-wider focus:outline-none focus:ring-2 transition uppercase"
                  style={{
                    backgroundColor: 'var(--surface-container-low)',
                    border: '1px solid var(--outline-variant)',
                    color: 'var(--foreground)'
                  }}
                  maxLength={12}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={handleCreateRoom}
                  className="flex-1 py-4 rounded-lg font-display font-semibold text-lg transition hover:scale-105 neon-glow"
                  style={{
                    backgroundColor: 'var(--primary-dark)',
                    color: 'var(--on-primary-container)'
                  }}
                >
                  Create New Room
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={!roomId.trim()}
                  className="flex-1 py-4 rounded-lg font-display font-semibold text-lg transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'rgba(180, 197, 255, 0.1)',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)'
                  }}
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>

          {/* Features Footer */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-mono-tech" style={{ color: 'var(--outline)' }}>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--secondary)' }}>•</span>
              Secure P2P WebRTC Connection
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--secondary)' }}>•</span>
              Browser Speech Logging
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--secondary)' }}>•</span>
              Gemini AI Judging
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}