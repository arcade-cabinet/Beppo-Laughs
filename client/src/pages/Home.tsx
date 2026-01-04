import { useState, useEffect } from 'react';
import { Scene } from '@/components/game/Scene';
import { MainMenu } from '@/components/game/MainMenu';
import { HUD } from '@/components/game/HUD';
import { useGameStore } from '@/game/store';

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [seed, setSeed] = useState<string>('');
  const { setSeed: setStoreSeed, resetFear } = useGameStore();

  const handleStart = (selectedSeed: string) => {
    // Reset game state for new session
    resetFear();
    setStoreSeed(selectedSeed);
    setSeed(selectedSeed);
    setIsPlaying(true);
  };

  const handleExit = () => {
    setIsPlaying(false);
    resetFear();
  };

  // Reset on mount
  useEffect(() => {
    resetFear();
  }, [resetFear]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {!isPlaying && <MainMenu onStart={handleStart} />}
      
      {isPlaying && (
        <>
          <div className="absolute inset-0 z-0">
             <Scene seed={seed} />
          </div>
          <HUD />
          
          {/* Exit Button */}
          <button 
            onClick={handleExit}
            className="absolute top-4 right-4 z-50 pointer-events-auto text-white/50 hover:text-white font-mono text-xs uppercase tracking-wider px-3 py-1 border border-white/20 hover:border-white/50 transition-all"
            data-testid="button-exit"
          >
            ESC
          </button>
        </>
      )}
    </div>
  );
}
