import { useState, useEffect } from 'react';
import { Scene } from '@/components/game/Scene';
import { MainMenu } from '@/components/game/MainMenu';
import { HUD } from '@/components/game/HUD';
import { useGameStore } from '@/game/store';

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [seed, setSeed] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const setSeedStore = useGameStore(state => state.setSeed);
  const resetGame = useGameStore(state => state.resetGame);
  const isGameOver = useGameStore(state => state.isGameOver);

  const handleStart = (selectedSeed: string) => {
    resetGame();
    setSeedStore(selectedSeed);
    setSeed(selectedSeed);
    setIsPlaying(true);
  };

  const handleExit = () => {
    setIsPlaying(false);
    resetGame();
  };

  // Detect mobile and reset on mount
  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    resetGame();
  }, [resetGame]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {!isPlaying && <MainMenu onStart={handleStart} />}
      
      {isPlaying && (
        <>
          <div className="absolute inset-0 z-0">
             <Scene seed={seed} />
          </div>
          <HUD />
          
          {/* Exit Button - hidden on mobile */}
          {!isMobile && (
            <button 
              onClick={handleExit}
              className="absolute top-4 right-4 z-50 pointer-events-auto text-white/50 hover:text-white font-mono text-xs uppercase tracking-wider px-3 py-1 border border-white/20 hover:border-white/50 transition-all"
              data-testid="button-exit"
            >
              ESC
            </button>
          )}
          
          {/* Mobile Exit Button - touch-friendly */}
          {isMobile && (
            <button 
              onClick={handleExit}
              className="absolute top-4 right-4 z-50 pointer-events-auto text-white/70 font-mono text-sm uppercase px-4 py-2 bg-black/50 border border-white/30 rounded"
              data-testid="button-exit-mobile"
            >
              EXIT
            </button>
          )}
          
          {/* Restart after game over */}
          {isGameOver && (
            <button 
              onClick={handleExit}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto text-white hover:text-red-500 font-creepy text-2xl uppercase tracking-wider px-6 py-2 border border-white/30 hover:border-red-500 transition-all"
              data-testid="button-restart"
            >
              TRY AGAIN
            </button>
          )}
        </>
      )}
    </div>
  );
}
