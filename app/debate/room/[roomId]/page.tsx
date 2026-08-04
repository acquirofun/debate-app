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
    shareMotion,
    shareCoinToss,
    sendTurnChange,
    onMotionShared,
    onCoinTossShared,
    onTurnChanged,
    error: webRTCError,
  } = useWebRTC(roomId);

  // Motion Generator
  const {
    motion,
    isGenerating: isGeneratingMotion,
    generateMotion,
  } = useMotionGenerator();

  // State for shared debate data
  const [sharedMotion, setSharedMotion] = useState<string>('');
  const [sharedCoinResult, setSharedCoinResult] = useState<any>(null);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [hasReceivedMotion, setHasReceivedMotion] = useState(false);

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
  } = useDebateTimer({ speechTime: 300, preparationTime: 300 });

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

  // Listen for shared motion from other user
  useEffect(() => {
    if (roomId) {
      const handleMotionShared = (receivedMotion: string) => {
        console.log('Received shared motion:', receivedMotion);
        setSharedMotion(receivedMotion);
        setHasReceivedMotion(true);
        setPhase('toss');
      };
      
      onMotionShared(handleMotionShared);
      
      return () => {
        // Cleanup listener when component unmounts
        const socket = (window as any).socketInstance;
        if (socket) {
          socket.off('motion-shared', handleMotionShared);
        }
      };
    }
  }, [roomId, onMotionShared]);

  // Listen for shared coin toss from other user
  useEffect(() => {
    if (roomId) {
      onCoinTossShared((result: any) => {
        console.log('Received shared coin toss:', result);
        setSharedCoinResult(result);
        setPhase('preparation');
        startPrepTimer();
      });
    }
  }, [roomId, onCoinTossShared, startPrepTimer]);

  // Listen for turn changes from other user
  useEffect(() => {
    if (roomId) {
      onTurnChanged((turn: string) => {
        console.log('Received turn change:', turn);
        if (turn === 'Government') {
          startTurn('Government');
        } else if (turn === 'Opposition') {
          startTurn('Opposition');
        }
      });
    }
  }, [roomId, onTurnChanged, startTurn]);

  const handleGenerateMotion = async () => {
    await generateMotion();
    setPhase('toss');
  };

  const handleFlipCoin = () => {
    flipCoin();
  };

  const handleConnectToOpponent = async () => {
    try {
      console.log('Manual connection attempt');
      await startCall();
    } catch (err) {
      console.error('Failed to connect:', err);
      // The error will be handled by the WebRTC hook
    }
  };

  // Automated workflow after connection - instant motion selection
  useEffect(() => {
    if (isConnected && phase === 'setup' && !hasReceivedMotion) {
      setPhase('motion');
      // Instantly generate motion without delay
      const runWorkflow = async () => {
        try {
          console.log('Starting instant motion generation...');
          await generateMotion();
          console.log('Motion generation completed, sharing with opponent');
          
          // Share motion with the other user
          if (motion) {
            shareMotion(motion, roomId);
            setSharedMotion(motion);
            setIsFirstUser(true);
          }
          
          // First user generates the coin toss
          setTimeout(() => {
            console.log('Starting coin flip...');
            flipCoin();
          }, 1000); // 1 second after motion
        } catch (err) {
          console.error('Error in automated workflow:', err);
        }
      };
      
      runWorkflow();
    }
  }, [isConnected, phase, hasReceivedMotion]);

  useEffect(() => {
    if (coinResult && !isFlipping) {
      setSharedCoinResult(coinResult);
      // Share coin toss result with the other user
      shareCoinToss(coinResult, roomId);
      setPhase('preparation');
      startPrepTimer();
    }
  }, [coinResult, isFlipping, startPrepTimer, shareCoinToss, roomId]);

  useEffect(() => {
    if (prepTimerExpired && phase === 'preparation') {
      setPhase('debate');
      resetPrepTimer();
      // Start with Government turn (5 minutes)
      startTurn('Government');
      setIsListening(true);
      // Notify the other user about the turn change
      sendTurnChange('Government', roomId);
    }
  }, [prepTimerExpired, phase, resetPrepTimer, startTurn, sendTurnChange, roomId]);

  const handleSwitchTurn = () => {
    nextRound();
    // Switch between Government and Opposition
    const newTurn = currentTurn === 'Government' ? 'Opposition' : 'Government';
    startTurn(newTurn);
    // Notify the other user about the turn change
    sendTurnChange(newTurn, roomId);
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
          {(coinResult || sharedCoinResult) && (
            <div className="mt-4 bg-gradient-to-r from-purple-900 to-blue-900 p-4 rounded-xl border border-purple-700">
              <p className="text-sm text-purple-300 mb-2">🪙 Coin Toss Result</p>
              <p className="text-xl font-bold text-white">{(coinResult || sharedCoinResult).result}</p>
              <div className="flex justify-center gap-4 mt-2">
                <div className="text-center">
                  <p className="text-sm text-gray-400">You</p>
                  <p className="text-lg font-bold text-green-400">{(coinResult || sharedCoinResult).yourRole}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Opponent</p>
                  <p className="text-lg font-bold text-red-400">{(coinResult || sharedCoinResult).opponentRole}</p>
                </div>
              </div>
            </div>
          )}
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
                      disabled={isConnecting}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                      {isConnecting ? '🔄 Connecting...' : '📞 Connect to Opponent'}
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
                  {isGeneratingMotion && !hasReceivedMotion ? (
                    <div>
                      <p className="text-lg">Generating debate motion...</p>
                      <div className="animate-spin text-4xl mt-2">⚙️</div>
                    </div>
                  ) : sharedMotion ? (
                    <div className="space-y-3">
                      <div className="bg-blue-900/50 p-4 rounded-lg">
                        <p className="text-blue-400 mb-2">✓ Motion generated successfully</p>
                        <p className="text-xl font-bold italic">"{sharedMotion}"</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg">Waiting for motion from opponent...</p>
                      <div className="animate-spin text-4xl mt-2">⚙️</div>
                    </div>
                  )}
                </div>
              )}

              {phase === 'toss' && (
                <div className="space-y-4 text-center">
                  <p className="text-lg">Flipping coin for side assignment...</p>
                  <div className="text-6xl mb-4">
                    {isFlipping ? '🪙' : (coinResult || sharedCoinResult) ? ((coinResult || sharedCoinResult).result === 'Heads' ? '👑' : '🦅') : '🪙'}
                  </div>
                  {(coinResult || sharedCoinResult) && (
                    <div className="space-y-2">
                      <p className="text-xl">Result: <span className="font-bold">{(coinResult || sharedCoinResult).result}</span></p>
                      <p className="text-lg">You are: <span className="font-bold text-green-400">{(coinResult || sharedCoinResult).yourRole}</span></p>
                      <p className="text-lg">Opponent is: <span className="font-bold text-red-400">{(coinResult || sharedCoinResult).opponentRole}</span></p>
                    </div>
                  )}
                </div>
              )}

              {phase === 'preparation' && (
                <div className="space-y-4 text-center">
                  {(coinResult || sharedCoinResult) && (
                    <div className="bg-purple-900/50 p-3 rounded-lg mb-4">
                      <p className="text-lg">🪙 Coin Toss Result</p>
                      <p className="text-xl font-bold">{(coinResult || sharedCoinResult).result}</p>
                      <p className="text-lg">You are: <span className="text-green-400 font-bold">{(coinResult || sharedCoinResult).yourRole}</span></p>
                      <p className="text-lg">Opponent is: <span className="text-red-400 font-bold">{(coinResult || sharedCoinResult).opponentRole}</span></p>
                    </div>
                  )}
                  <div className="text-5xl font-mono font-bold text-yellow-400">
                    {formattedPrepTime}
                  </div>
                  <p className="text-gray-400">Preparation Time (5 minutes)</p>
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
                    <p className="text-lg">Current Turn: <span className="font-bold capitalize">{currentTurn === 'Government' ? 'Government (5 min)' : 'Opposition (5 min)'}</span></p>
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
                          <p className="text-sm">Government</p>
                          <p className="text-2xl font-bold">{judgeResult.governmentScore}</p>
                        </div>
                        <div className="bg-red-900/50 p-3 rounded">
                          <p className="text-sm">Opposition</p>
                          <p className="text-2xl font-bold">{judgeResult.oppositionScore}</p>
                        </div>
                      </div>

                      <div className="bg-gray-700 p-3 rounded max-h-40 overflow-y-auto">
                        <p className="text-sm whitespace-pre-wrap">{judgeResult.analysis}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-green-900/30 p-2 rounded">
                          <p className="text-xs text-green-400 mb-1">Government Feedback</p>
                          <p className="text-xs">{judgeResult.feedback?.government || 'N/A'}</p>
                        </div>
                        <div className="bg-red-900/30 p-2 rounded">
                          <p className="text-xs text-red-400 mb-1">Opposition Feedback</p>
                          <p className="text-xs">{judgeResult.feedback?.opposition || 'N/A'}</p>
                        </div>
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
                        judgeDebate(fullTranscript, motion || sharedMotion);
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