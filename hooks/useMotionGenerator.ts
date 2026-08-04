import { useState } from 'react';

export const useMotionGenerator = () => {
  const [motion, setMotion] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMotion = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      console.log('Starting motion generation...');

      const response = await fetch('/api/generate-motion', {
        method: 'POST',
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to generate motion');
      }

      const data = await response.json();
      console.log('Generated motion:', data.motion);
      setMotion(data.motion);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate motion. Please try again.';
      setError(errorMessage);
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