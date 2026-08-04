import { useState, useEffect, useRef } from 'react';

interface TranscriptEntry {
  id: string;
  speaker: 'You' | 'Opponent';
  text: string;
  timestamp: Date;
  round: number;
}

export const useSpeechRecognition = (isListening: boolean) => {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [round, setRound] = useState(1);
  
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentText(interimTranscript);

        if (finalTranscript) {
          addEntry(finalTranscript, 'You');
          setCurrentText('');
        }

        // Reset silence timeout when speech is detected
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          if (currentText) {
            addEntry(currentText, 'You');
            setCurrentText('');
          }
        }, 2000);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          console.error('Microphone permission denied');
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart if still supposed to be listening
          recognitionRef.current?.start();
        } else {
          setIsRecognizing(false);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [isListening]);

  useEffect(() => {
    if (isListening && recognitionRef.current && !isRecognizing) {
      try {
        recognitionRef.current.start();
        setIsRecognizing(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    } else if (!isListening && recognitionRef.current && isRecognizing) {
      recognitionRef.current.stop();
      setIsRecognizing(false);
    }
  }, [isListening, isRecognizing]);

  const addEntry = (text: string, speaker: 'You' | 'Opponent') => {
    if (!text.trim()) return;
    
    const newEntry: TranscriptEntry = {
      id: Date.now().toString(),
      speaker,
      text: text.trim(),
      timestamp: new Date(),
      round,
    };
    
    setTranscript((prev) => [...prev, newEntry]);
  };

  const addOpponentEntry = (text: string) => {
    addEntry(text, 'Opponent');
  };

  const nextRound = () => {
    setRound((prev) => prev + 1);
  };

  const reset = () => {
    setTranscript([]);
    setCurrentText('');
    setRound(1);
  };

  const getFullTranscript = () => {
    return transcript
      .map((entry) => `[${entry.speaker} - Round ${entry.round}]: ${entry.text}`)
      .join('\n');
  };

  return {
    transcript,
    currentText,
    round,
    isRecognizing,
    addOpponentEntry,
    nextRound,
    reset,
    getFullTranscript,
  };
};