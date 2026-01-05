import { useCallback, useEffect, useState } from 'react';
import { HUD } from '@/components/game/HUD';
import { MainMenu } from '@/components/game/MainMenu';
import { Scene } from '@/components/game/Scene';
import { useGameStore } from '@/game/store';

/**
 * Root UI component that manages game lifecycle, fullscreen/orientation behavior, and renders the main menu, game scene, HUD, and controls.
 *
 * Handles starting and exiting games (resetting and seeding the store), requests fullscreen and attempts to lock orientation on mobile, monitors device orientation to show a rotate prompt when needed, and conditionally renders exit/restart controls and the MainMenu or active Scene/HUD.
 *
 * @returns The rendered JSX element containing the home screen UI (MainMenu, Scene, HUD, exit/restart buttons, and rotate prompt).
 */
export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showRotatePrompt, setShowRotatePrompt] = useState(false);
  const seed = useGameStore((state) => state.seed);
  const setSeedStore = useGameStore((state) => state.setSeed);
  const resetGame = useGameStore((state) => state.resetGame);
  const isGameOver = useGameStore((state) => state.isGameOver);

  // Request fullscreen and lock orientation
  const enterFullscreen = useCallback(async () => {
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

      // Lock orientation to landscape
      if (screen.orientation && (screen.orientation as any).lock) {
        try {
          await (screen.orientation as any).lock('landscape');
        } catch (_e) {
          // Orientation lock may not be supported
          console.log('Orientation lock not supported');
        }
      }
    } catch (_e) {
      console.log('Fullscreen not supported or denied');
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    if (screen.orientation?.unlock) {
      try {
        screen.orientation.unlock();
      } catch (_e) {}
    }
  }, []);

  const handleStart = async (selectedSeed: string) => {
    resetGame();
    setSeedStore(selectedSeed);

    // Enter fullscreen on mobile
    if (isMobile) {
      await enterFullscreen();
    }

    setIsPlaying(true);
  };

  const handleExit = () => {
    setIsPlaying(false);
    resetGame();
    exitFullscreen();
  };

  // Detect mobile and reset on mount
  useEffect(() => {
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(mobile);
    resetGame();
  }, [resetGame]);

  // Check orientation on mobile
  useEffect(() => {
    if (!isMobile) return;

    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      setShowRotatePrompt(isPlaying && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [isMobile, isPlaying]);

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

      {/* Rotate Device Prompt */}
      {showRotatePrompt && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <div className="text-white font-creepy text-3xl mb-4 animate-pulse">📱➡️📱</div>
          <div className="text-white/90 font-creepy text-2xl text-center px-8">
            ROTATE YOUR DEVICE
          </div>
          <div className="text-white/60 font-mono text-sm mt-4">Landscape mode required</div>
        </div>
      )}
    </div>
  );
}
