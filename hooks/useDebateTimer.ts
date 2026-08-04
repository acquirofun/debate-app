import { useState, useEffect, useRef } from 'react';

export type SpeechTurn = 'Government' | 'Opposition';

interface DebateTimerConfig {
  speechTime: number; // in seconds
  preparationTime: number; // in seconds
}

export const useDebateTimer = (config: DebateTimerConfig = { speechTime: 300, preparationTime: 300 }) => {
  const [timeLeft, setTimeLeft] = useState(config.speechTime);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<SpeechTurn | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const startTurn = (turn: SpeechTurn) => {
    setCurrentTurn(turn);
    setTimeLeft(config.speechTime);
    setIsRunning(true);
    setIsExpired(false);
  };

  const startPreparation = () => {
    setCurrentTurn(null);
    setTimeLeft(config.preparationTime);
    setIsRunning(true);
    setIsExpired(false);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const resume = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const reset = () => {
    setTimeLeft(config.speechTime);
    setIsRunning(false);
    setIsExpired(false);
    setCurrentTurn(null);
  };

  const switchTurn = () => {
    const newTurn: SpeechTurn = currentTurn === 'Affirmative' ? 'Negative' : 'Affirmative';
    startTurn(newTurn);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isRunning,
    isExpired,
    currentTurn,
    startTurn,
    startPreparation,
    pause,
    resume,
    reset,
    switchTurn,
  };
};