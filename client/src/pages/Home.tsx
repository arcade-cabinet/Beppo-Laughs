import { useState, useEffect, useCallback, useRef } from 'react';
import { Scene } from '@/components/game/Scene';
import { HUD } from '@/components/game/HUD';
import { useGameStore } from '@/game/store';

// Minimum screen dimension (in pixels) to be considered a "large screen" (tablet/foldable)
// Devices below this threshold in BOTH dimensions are considered phones and need landscape enforcement
const TABLET_MIN_DIMENSION = 600;

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [seed, setSeed] = useState<string>('');
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [showRotatePrompt, setShowRotatePrompt] = useState(false);
  const hasAutoStarted = useRef(false);
  const setSeedStore = useGameStore(state => state.setSeed);
  const resetGame = useGameStore(state => state.resetGame);
  const isGameOver = useGameStore(state => state.isGameOver);

  // Check if device is a small screen (phone) vs tablet/foldable
  const checkScreenSize = useCallback(() => {
    // Get the larger dimension (to account for orientation)
    const largerDim = Math.max(window.innerWidth, window.innerHeight);
    // If even the larger dimension is small, it's definitely a phone
    // Tablets typically have at least 768px on their shorter side
    return largerDim < TABLET_MIN_DIMENSION || 
           (window.innerWidth < TABLET_MIN_DIMENSION && window.innerHeight < TABLET_MIN_DIMENSION);
  }, []);

  // Request fullscreen and optionally lock orientation (only on small screens)
  const enterFullscreen = useCallback(async (lockOrientation: boolean) => {
    try {
      const elem = document.documentElement;
      
      // Request fullscreen
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
      
      // Lock orientation to landscape only on small screens (phones)
      if (lockOrientation && screen.orientation && (screen.orientation as any).lock) {
        try {
          await (screen.orientation as any).lock('landscape');
        } catch (e) {
          console.log('Orientation lock not supported');
        }
      }
    } catch (e) {
      console.log('Fullscreen not supported or denied');
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    if (screen.orientation && screen.orientation.unlock) {
      try {
        screen.orientation.unlock();
      } catch (e) {}
    }
  }, []);

  const startGame = useCallback(async () => {
    if (isPlaying) return;
    
    resetGame();
    const randomSeed = Math.random().toString(36).substring(2, 10);
    setSeedStore(randomSeed);
    setSeed(randomSeed);
    
    const smallScreen = checkScreenSize();
    setIsSmallScreen(smallScreen);
    
    // Enter fullscreen for everyone, but only lock orientation on small screens
    await enterFullscreen(smallScreen);
    
    setIsPlaying(true);
  }, [isPlaying, resetGame, setSeedStore, checkScreenSize, enterFullscreen]);

  const handleExit = () => {
    setIsPlaying(false);
    resetGame();
    exitFullscreen();
    hasAutoStarted.current = false;
  };

  // Auto-start game immediately on mount
  useEffect(() => {
    if (!hasAutoStarted.current) {
      hasAutoStarted.current = true;
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startGame();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [startGame]);

  // Check orientation only on small screens (phones)
  useEffect(() => {
    if (!isSmallScreen || !isPlaying) {
      setShowRotatePrompt(false);
      return;
    }
    
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      setShowRotatePrompt(isPortrait);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [isSmallScreen, isPlaying]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Loading state while auto-starting */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/60 font-creepy text-2xl animate-pulse">
            ENTERING THE NIGHTMARE...
          </div>
        </div>
      )}
      
      {isPlaying && (
        <>
          <div className="absolute inset-0 z-0">
             <Scene seed={seed} />
          </div>
          <HUD />
          
          {/* Exit Button - touch-friendly on all devices */}
          <button 
            onClick={handleExit}
            className="absolute top-4 right-4 z-50 pointer-events-auto text-white/70 font-mono text-sm uppercase px-4 py-2 bg-black/50 border border-white/30 rounded"
            data-testid="button-exit"
          >
            EXIT
          </button>
          
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
      
      {/* Rotate Device Prompt */}
      {showRotatePrompt && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <div className="text-white font-creepy text-3xl mb-4 animate-pulse">
            📱➡️📱
          </div>
          <div className="text-white/90 font-creepy text-2xl text-center px-8">
            ROTATE YOUR DEVICE
          </div>
          <div className="text-white/60 font-mono text-sm mt-4">
            Landscape mode required
          </div>
        </div>
      )}
    </div>
  );
}
