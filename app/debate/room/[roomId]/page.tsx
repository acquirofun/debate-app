'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useMotionGenerator } from '@/hooks/useMotionGenerator';
import { useCoinFlip, DebateRole } from '@/hooks/useCoinFlip';
import { usePreparationTimer } from '@/hooks/usePreparationTimer';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useDebateTimer } from '@/hooks/useDebateTimer';
import { useJudge } from '@/hooks/useJudge';
import VideoLayout from '@/components/VideoLayout';

type DebatePhase = 'setup' | 'motion' | 'toss' | 'preparation' | 'debate' | 'finished';

export default function DebateRoom() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [phase, setPhase] = useState<DebatePhase>('setup');
  const [isListening, setIsListening] = useState(false);

  // WebRTC
  const {
    localStream,
    remoteStream,
    isConnecting,
    isConnected,
    joinRoom,
    startCall,
    initializeMedia,
    error: webRTCError,
  } = useWebRTC(roomId);

  // Motion Generator
  const {
    motion,
    isGenerating: isGeneratingMotion,
    generateMotion,
  } = useMotionGenerator();

  // Coin Flip
  const {
    isFlipping,
    result: coinResult,
    flipCoin,
    reset: resetCoin,
  } = useCoinFlip();

  // Preparation Timer
  const {
    timeLeft: prepTimeLeft,
    formattedTime: formattedPrepTime,
    isRunning: prepTimerRunning,
    isExpired: prepTimerExpired,
    start: startPrepTimer,
    reset: resetPrepTimer,
  } = usePreparationTimer(false);

  // Speech Recognition
  const {
    transcript,
    currentText,
    round,
    addOpponentEntry,
    nextRound,
    reset: resetTranscript,
    getFullTranscript,
  } = useSpeechRecognition(isListening);

  // Debate Timer
  const {
    timeLeft: debateTimeLeft,
    formattedTime: formattedDebateTime,
    isRunning: debateTimerRunning,
    isExpired: debateTimerExpired,
    currentTurn,
    startTurn,
    pause: pauseDebateTimer,
    resume: resumeDebateTimer,
    switchTurn,
    reset: resetDebateTimer,
  } = useDebateTimer({ speechTime: 180, preparationTime: 60 });

  // AI Judge
  const {
    result: judgeResult,
    isJudging,
    judgeDebate,
  } = useJudge();

  useEffect(() => {
    if (roomId) {
      // Only join once
      joinRoom(roomId);
    }
  }, [roomId, joinRoom]);

  useEffect(() => {
    if (isConnected && phase === 'setup') {
      setPhase('motion');
    }
  }, [isConnected, phase]);

  // Initialize media when entering the room (only once)
  useEffect(() => {
    const initMedia = async () => {
      try {
        if (!localStream) {
          await initializeMedia();
        }
      } catch (err) {
        console.error('Failed to initialize media:', err);
      }
    };
    
    if (roomId && phase === 'setup' && !localStream) {
      initMedia();
    }
  }, [roomId, phase, localStream, initializeMedia]);

  const handleGenerateMotion = async () => {
    await generateMotion();
    setPhase('toss');
  };

  const handleFlipCoin = () => {
    flipCoin();
  };

  const handleConnectToOpponent = async () => {
    try {
      await startCall();
    } catch (err) {
      console.error('Failed to connect:', err);
    }
  };

  // Automated workflow after connection
  useEffect(() => {
    if (isConnected && phase === 'setup') {
      setPhase('motion');
      // Automatically generate motion after 10 seconds
      const motionTimer = setTimeout(async () => {
        try {
          await generateMotion();
          setPhase('toss');
          // Automatically flip coin after motion generation
          setTimeout(() => {
            flipCoin();
          }, 2000); // 2 seconds after motion
        } catch (err) {
          console.error('Error in automated workflow:', err);
        }
      }, 10000); // 10 seconds after connection
      
      return () => clearTimeout(motionTimer);
    }
  }, [isConnected, phase, generateMotion, flipCoin]);

  useEffect(() => {
    if (coinResult && !isFlipping) {
      setPhase('preparation');
      startPrepTimer();
    }
  }, [coinResult, isFlipping, startPrepTimer]);

  useEffect(() => {
    if (prepTimerExpired && phase === 'preparation') {
      setPhase('debate');
      resetPrepTimer();
      // Start with Affirmative turn
      startTurn('Affirmative');
      setIsListening(true);
    }
  }, [prepTimerExpired, phase, resetPrepTimer, startTurn]);

  const handleSwitchTurn = () => {
    nextRound();
    switchTurn();
  };

  const handleFinishDebate = () => {
    setIsListening(false);
    pauseDebateTimer();
    setPhase('finished');
    const fullTranscript = getFullTranscript();
    judgeDebate(fullTranscript, motion);
  };

  const handleStartOver = () => {
    setPhase('setup');
    resetCoin();
    resetPrepTimer();
    resetTranscript();
    resetDebateTimer();
    setIsListening(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">P2P Video Debate</h1>
          <p className="text-gray-400">Room Code: <span className="text-2xl font-mono text-blue-400">{roomId}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2">
            <VideoLayout
              localStream={localStream}
              remoteStream={remoteStream}
              isConnected={isConnected}
              isConnecting={isConnecting}
              error={webRTCError}
            />
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            {/* Phase Indicator */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Current Phase</h2>
              <div className="text-2xl font-bold text-blue-400 capitalize">{phase}</div>
            </div>

            {/* Motion Display */}
            {motion && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-2">Motion</h2>
                <p className="text-lg italic">"{motion}"</p>
              </div>
            )}

            {/* Phase Controls */}
            <div className="bg-gray-800 rounded-lg p-4">
              {phase === 'setup' && (
                <div className="space-y-4 text-center">
                  <p className="mb-4">Waiting for opponent to join...</p>
                  {isConnected && <p className="text-green-400">✓ Connected! Starting debate setup in 10 seconds...</p>}
                  
                  {!localStream && (
                    <button
                      onClick={async () => {
                        try {
                          await initializeMedia();
                        } catch (err) {
                          console.error('Failed to initialize media:', err);
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                      🎤 Enable Camera & Microphone
                    </button>
                  )}
                  
                  {localStream && !isConnected && (
                    <button
                      onClick={handleConnectToOpponent}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                      📞 Connect to Opponent
                    </button>
                  )}
                  
                  {localStream && (
                    <div className="bg-green-900/50 p-3 rounded-lg">
                      <p className="text-green-400">✓ Camera & Microphone Ready</p>
                    </div>
                  )}
                </div>
              )}

              {phase === 'motion' && (
                <div className="space-y-4 text-center">
                  <p className="text-lg">Generating debate motion...</p>
                  {isGeneratingMotion && (
                    <div className="animate-spin text-4xl">⚙️</div>
                  )}
                  {!isGeneratingMotion && motion && (
                    <div className="bg-blue-900/50 p-3 rounded-lg">
                      <p className="text-blue-400">✓ Motion generated successfully</p>
                    </div>
                  )}
                </div>
              )}

              {phase === 'toss' && (
                <div className="space-y-4 text-center">
                  <p className="text-lg">Flipping coin for side assignment...</p>
                  <div className="text-6xl mb-4">
                    {isFlipping ? '🪙' : coinResult ? (coinResult.result === 'Heads' ? '👑' : '🦅') : '🪙'}
                  </div>
                  {coinResult && (
                    <div className="space-y-2">
                      <p className="text-xl">Result: <span className="font-bold">{coinResult.result}</span></p>
                      <p className="text-lg">You are: <span className="font-bold text-green-400">{coinResult.yourRole}</span></p>
                      <p className="text-lg">Opponent is: <span className="font-bold text-red-400">{coinResult.opponentRole}</span></p>
                    </div>
                  )}
                </div>
              )}

              {phase === 'preparation' && (
                <div className="space-y-4 text-center">
                  <div className="text-5xl font-mono font-bold text-yellow-400">
                    {formattedPrepTime}
                  </div>
                  <p className="text-gray-400">Preparation Time</p>
                  <div className="text-sm text-gray-500">
                    Prepare your arguments for the motion!
                  </div>
                </div>
              )}

              {phase === 'debate' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-mono font-bold text-blue-400 mb-2">
                      {formattedDebateTime}
                    </div>
                    <p className="text-lg">Current Turn: <span className="font-bold capitalize">{currentTurn}</span></p>
                    <p className="text-sm text-gray-400">Round {round}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {debateTimerRunning ? (
                      <button
                        onClick={pauseDebateTimer}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition"
                      >
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={resumeDebateTimer}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
                      >
                        Resume
                      </button>
                    )}
                    <button
                      onClick={handleSwitchTurn}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                      Switch Turn
                    </button>
                  </div>

                  <button
                    onClick={handleFinishDebate}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    End Debate
                  </button>
                </div>
              )}

              {phase === 'finished' && (
                <div className="space-y-4">
                  {isJudging ? (
                    <div className="text-center">
                      <p className="text-lg">AI Judge is evaluating the debate...</p>
                      <div className="animate-spin text-4xl">⚖️</div>
                    </div>
                  ) : judgeResult ? (
                    <div className="space-y-3">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-yellow-400">Winner: {judgeResult.winner}</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-green-900/50 p-3 rounded">
                          <p className="text-sm">Affirmative</p>
                          <p className="text-2xl font-bold">{judgeResult.affirmativeScore}</p>
                        </div>
                        <div className="bg-red-900/50 p-3 rounded">
                          <p className="text-sm">Negative</p>
                          <p className="text-2xl font-bold">{judgeResult.negativeScore}</p>
                        </div>
                      </div>

                      <div className="bg-gray-700 p-3 rounded max-h-40 overflow-y-auto">
                        <p className="text-sm whitespace-pre-wrap">{judgeResult.analysis}</p>
                      </div>

                      <button
                        onClick={handleStartOver}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                      >
                        Start New Debate
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        const fullTranscript = getFullTranscript();
                        judgeDebate(fullTranscript, motion);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                      Get AI Judgment
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Transcript Panel */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Live Transcript</h2>
                <span className="text-sm text-gray-400">Round {round}</span>
              </div>
              <div className="bg-gray-900 rounded p-3 h-64 overflow-y-auto space-y-2">
                {transcript.length === 0 && !currentText && (
                  <p className="text-gray-500 text-center">No speech detected yet...</p>
                )}
                {transcript.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-2 rounded ${
                      entry.speaker === 'You' ? 'bg-blue-900/50' : 'bg-red-900/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm">{entry.speaker}</span>
                      <span className="text-xs text-gray-400">Round {entry.round}</span>
                    </div>
                    <p className="text-sm">{entry.text}</p>
                  </div>
                ))}
                {currentText && (
                  <div className="p-2 rounded bg-gray-700 animate-pulse">
                    <p className="text-sm text-gray-300">{currentText}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}