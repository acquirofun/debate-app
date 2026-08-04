import { useState } from 'react';

interface JudgeResult {
  analysis: string;
  affirmativeScore: number;
  negativeScore: number;
  winner: string;
  feedback: {
    affirmative: string;
    negative: string;
  };
}

export const useJudge = () => {
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [isJudging, setIsJudging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const judgeDebate = async (transcript: string, motion: string) => {
    try {
      setIsJudging(true);
      setError(null);

      const response = await fetch('/api/judge-debate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript, motion }),
      });

      if (!response.ok) {
        throw new Error('Failed to judge debate');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to judge debate. Please try again.');
      console.error('Error judging debate:', err);
    } finally {
      setIsJudging(false);
    }
  };

  return {
    result,
    isJudging,
    error,
    judgeDebate,
  };
};