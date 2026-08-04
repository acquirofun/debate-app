import { useState } from 'react';

export type Side = 'Heads' | 'Tails';
export type DebateRole = 'Government' | 'Opposition';

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
      // If heads, you're Government; if tails, you're Opposition
      const yourRole: DebateRole = randomSide === 'Heads' ? 'Government' : 'Opposition';
      const opponentRole: DebateRole = randomSide === 'Heads' ? 'Opposition' : 'Government';

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