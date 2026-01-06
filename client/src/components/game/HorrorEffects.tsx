import { useGameStore } from '@/game/store';
import { useEffect, useState } from 'react';

/**
 * Horror screen effects component
 * Adds chromatic aberration, scanlines, and glitch effects that intensify with insanity
 */
export function HorrorEffects() {
  const { fear, despair, maxSanity, isGameOver } = useGameStore();
  const [glitchActive, setGlitchActive] = useState(false);
  const [glitchStyle, setGlitchStyle] = useState({});

  const avgInsanity = maxSanity > 0 ? (fear + despair) / 2 / maxSanity : 0;
  const highInsanity = avgInsanity > 0.6;
  const extremeInsanity = avgInsanity > 0.8;

  // Random glitch bursts at high insanity
  useEffect(() => {
    if (!highInsanity) return;

    const triggerGlitch = () => {
      if (Math.random() < avgInsanity * 0.3) {
        setGlitchStyle({
          clipPath: `polygon(
            0 ${Math.random() * 30}%,
            100% ${Math.random() * 30}%,
            100% ${30 + Math.random() * 20}%,
            0 ${30 + Math.random() * 20}%
          )`,
          transform: `translateX(${(Math.random() - 0.5) * 20}px)`,
          background: 'rgba(255, 0, 0, 0.1)',
        });
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 50 + Math.random() * 150);
      }
    };

    const interval = setInterval(triggerGlitch, 500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [highInsanity, avgInsanity]);

  if (isGameOver) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {/* CRT Scanlines */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.04 + avgInsanity * 0.08,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.3) 2px,
            rgba(0, 0, 0, 0.3) 4px
          )`,
          animation: highInsanity ? 'scanlineShift 0.1s steps(2) infinite' : 'none',
        }}
      />

      {/* Chromatic Aberration Effect */}
      {avgInsanity > 0.3 && (
        <>
          {/* Red channel offset */}
          <div
            className="absolute inset-0 mix-blend-screen"
            style={{
              opacity: avgInsanity * 0.15,
              background: 'transparent',
              boxShadow: `inset ${avgInsanity * 4}px 0 0 rgba(255, 0, 0, 0.3)`,
            }}
          />
          {/* Cyan channel offset */}
          <div
            className="absolute inset-0 mix-blend-screen"
            style={{
              opacity: avgInsanity * 0.15,
              background: 'transparent',
              boxShadow: `inset ${-avgInsanity * 4}px 0 0 rgba(0, 255, 255, 0.3)`,
            }}
          />
        </>
      )}

      {/* Glitch displacement effect */}
      {glitchActive && (
        <div
          className="absolute inset-0"
          style={glitchStyle}
        />
      )}

      {/* VHS tracking lines */}
      {extremeInsanity && (
        <div
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 3px,
              rgba(255, 255, 255, 0.02) 3px,
              rgba(255, 255, 255, 0.02) 6px
            )`,
            animation: 'vhsTrack 0.5s linear infinite',
          }}
        />
      )}

      {/* Edge vignette intensification */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: `inset 0 0 ${80 + avgInsanity * 60}px rgba(0, 0, 0, ${0.3 + avgInsanity * 0.4})`,
        }}
      />

      {/* Flickering overlay at extreme insanity */}
      {extremeInsanity && (
        <div
          className="absolute inset-0 bg-white mix-blend-overlay"
          style={{
            opacity: Math.random() < 0.1 ? 0.05 : 0,
            animation: 'flicker 0.15s steps(2) infinite',
          }}
        />
      )}

      {/* Horror corner shadows */}
      <div
        className="absolute top-0 left-0 w-1/3 h-1/3"
        style={{
          background: `radial-gradient(circle at 0 0, rgba(139, 0, 0, ${avgInsanity * 0.2}) 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-1/3 h-1/3"
        style={{
          background: `radial-gradient(circle at 100% 100%, rgba(139, 0, 0, ${avgInsanity * 0.2}) 0%, transparent 70%)`,
        }}
      />

      {/* Inline keyframes */}
      <style>{`
        @keyframes scanlineShift {
          0% { transform: translateY(0); }
          50% { transform: translateY(2px); }
          100% { transform: translateY(0); }
        }
        @keyframes vhsTrack {
          0% { transform: translateY(0); }
          100% { transform: translateY(6px); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.05; }
        }
      `}</style>
    </div>
  );
}
