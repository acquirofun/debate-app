import { useState } from 'react';

export type Side = 'Heads' | 'Tails';
export type DebateRole = 'Affirmative' | 'Negative';

interface CoinFlipResult {
  result: Side;
  yourRole: DebateRole;
  opponentRole: DebateRole;
}

export const useCoinFlip = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<CoinFlipResult | null>(null);

  const flipCoin = () => {
    setIsFlipping(true);
    setResult(null);

    // Simulate coin flip animation
    setTimeout(() => {
      const sides: Side[] = ['Heads', 'Tails'];
      const randomSide = sides[Math.floor(Math.random() * sides.length)];
      
      // Assign roles based on coin flip
      // If heads, you're Affirmative; if tails, you're Negative
      const yourRole: DebateRole = randomSide === 'Heads' ? 'Affirmative' : 'Negative';
      const opponentRole: DebateRole = randomSide === 'Heads' ? 'Negative' : 'Affirmative';

      setResult({
        result: randomSide,
        yourRole,
        opponentRole,
      });
      setIsFlipping(false);
    }, 2000);
  };

  const reset = () => {
    setResult(null);
    setIsFlipping(false);
  };

  return {
    isFlipping,
    result,
    flipCoin,
    reset,
  };
};