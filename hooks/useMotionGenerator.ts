import { useState } from 'react';

export const useMotionGenerator = () => {
  const [motion, setMotion] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMotion = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch('/api/generate-motion', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate motion');
      }

      const data = await response.json();
      setMotion(data.motion);
    } catch (err) {
      setError('Failed to generate motion. Please try again.');
      console.error('Error generating motion:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    motion,
    isGenerating,
    error,
    generateMotion,
  };
};