import { useCallback, useEffect, useState } from 'react';
import { HUD } from '@/components/game/HUD';
import { MainMenu } from '@/components/game/MainMenu';
import { Scene } from '@/components/game/Scene';
import { useGameStore } from '@/game/store';

/**
 * Check if WebGL is supported by the browser.
 * This is a synchronous check done once at startup.
 */
function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return !!gl;
  } catch {
    return false;
  }
}

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
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const seed = useGameStore((state) => state.seed);
  const setSeedStore = useGameStore((state) => state.setSeed);
  const resetGame = useGameStore((state) => state.resetGame);
  const isGameOver = useGameStore((state) => state.isGameOver);

  // Request fullscreen and lock orientation
  const enterFullscreen = useCallback(async () => {
    try {
      type FullscreenElement = HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      };

      const elem = document.documentElement as FullscreenElement;

      // Request fullscreen
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
    } catch (_e) {
      console.log('Fullscreen not supported or denied');
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const handleStart = async (selectedSeed: string, isNewGame: boolean) => {
    if (isNewGame) {
      resetGame();
      setSeedStore(selectedSeed);
    }
    // If continuing, we assume state is already loaded from persist middleware

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

  // Check WebGL support and detect mobile on mount
  useEffect(() => {
    setWebglSupported(checkWebGLSupport());
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(mobile);
    // Don't auto-reset game on mount, let persistence load state
  }, []);

  // Check orientation on mobile
  useEffect(() => {
    // We now support portrait mode, so no need to force rotation
    setShowRotatePrompt(false);
  }, []);

  // Show loading while checking WebGL
  if (webglSupported === null) {
    return (
      <div className="relative w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white font-mono">Loading...</div>
      </div>
    );
  }

  // Show error if WebGL not supported - no fallbacks, just a clear message
  if (!webglSupported) {
    return (
      <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center p-8">
        <div className="text-red-500 font-creepy text-4xl mb-6">BROWSER NOT SUPPORTED</div>
        <div className="text-white/80 font-mono text-center max-w-md mb-4">
          This game requires WebGL to run. Your browser does not support WebGL or it has been
          disabled.
        </div>
        <div className="text-white/60 font-mono text-sm text-center max-w-md">
          Please try a modern browser like Chrome, Firefox, Safari, or Edge with hardware
          acceleration enabled.
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {!isPlaying && <MainMenu onStart={handleStart} />}

      {isPlaying && (
        <>
          <div className="absolute inset-0 z-0 w-full h-full">
            <Scene seed={seed} />
          </div>
          <HUD />

          {/* Exit Button - hidden on mobile */}
          {!isMobile && (
            <button
              type="button"
              onClick={handleExit}
              className="absolute top-4 right-4 z-50 pointer-events-auto text-white/50 hover:text-white font-mono text-xs uppercase tracking-wider px-3 py-1 border border-white/20 hover:border-white/50 transition-all backdrop-blur-sm"
              data-testid="button-exit"
            >
              ESC
            </button>
          )}

          {/* Mobile Exit Button - touch-friendly */}
          {isMobile && (
            <button
              type="button"
              onClick={handleExit}
              className="absolute top-4 right-4 z-50 pointer-events-auto text-white/70 font-mono text-sm uppercase px-4 py-2 bg-black/50 border border-white/30 rounded backdrop-blur-sm"
              data-testid="button-exit-mobile"
            >
              EXIT
            </button>
          )}

          {/* Restart after game over */}
          {isGameOver && (
            <button
              type="button"
              onClick={handleExit}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto text-white hover:text-red-500 font-creepy text-2xl uppercase tracking-wider px-6 py-2 border border-white/30 hover:border-red-500 transition-all backdrop-blur-sm bg-black/30"
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
