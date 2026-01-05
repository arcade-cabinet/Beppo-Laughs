import beppoVideoUrl from '@assets/generated_videos/beppo_clown_emerging_laughing_game_over.mp4';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../game/store';

type MeterPanelProps = {
  label: string;
  percent: number;
  color: string;
  side: 'left' | 'right';
};

const METER_GRADIENT_ENDPOINTS = {
  left: '#ffcfb0',
  right: '#c5ddff'
} as const;

function DashMeterPanel({ label, percent, color, side }: MeterPanelProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const isLeft = side === 'left';

  return (
    <div
      aria-hidden
      className={`hud-dash-panel ${
        isLeft ? 'hud-dash-panel--left' : 'hud-dash-panel--right'
      } pointer-events-none select-none`}
    >
      <div className="hud-dash-hood" />
      <div className="hud-dash-window">
        <div className="hud-dash-label-row">
          <span className="hud-dash-label">{label}</span>
          <span className="hud-dash-value">{clamped}%</span>
        </div>
        <div className="hud-dash-meter-track">
          <div
            className="hud-dash-meter-fill"
            style={{
              width: `${clamped}%`,
              background: `linear-gradient(90deg, ${color}, ${
                METER_GRADIENT_ENDPOINTS[side]
              })`,
              boxShadow: `0 0 22px ${color}66, 0 0 8px ${color}99`
            }}
          />
          <div className="hud-dash-meter-grid" />
        </div>
        <div className="hud-dash-readout">
          {isLeft ? 'FRONT HOOD — LEFT' : 'FRONT HOOD — RIGHT'}
        </div>
      </div>
    </div>
  );
}

function HintButton() {
  const { hintActive, toggleHint, isGameOver, hasWon } = useGameStore();

  if (isGameOver || hasWon) return null;

  return (
    <button
      data-testid="button-hint"
      className={`pointer-events-auto absolute bottom-6 right-6 px-4 py-3 rounded-full font-creepy text-lg transition-all duration-300 ${
        hintActive
          ? 'bg-pink-600 text-white shadow-[0_0_20px_rgba(255,68,136,0.8)] animate-pulse'
          : 'bg-amber-900/80 text-amber-200 hover:bg-amber-800 border-2 border-amber-600/50'
      }`}
      onClick={toggleHint}
    >
      {hintActive ? '👁️ SEEING' : '🤡 HINT'}
    </button>
  );
}

export function HUD() {
  const { fear, despair, maxSanity, isGameOver, hasWon, visitedCells } = useGameStore();
  const isInverted = useGameStore((state) => state.isInverted());
  const sanityLevel = useGameStore((state) => state.getSanityLevel());
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const fearPercent = maxSanity > 0 ? (fear / maxSanity) * 100 : 0;
  const despairPercent = maxSanity > 0 ? (despair / maxSanity) * 100 : 0;
  const FEAR_METER_COLOR = '#ff2d2d';
  const DESPAIR_METER_COLOR = '#3b82f6';
  
  const avgInsanity = (fear + despair) / 2 / maxSanity;
  const redOverlayOpacity = Math.min(fear / 300, 0.2);
  const blueOverlayOpacity = Math.min(despair / 300, 0.2);
  const cellsExplored = visitedCells.size;

  useEffect(() => {
    if (isGameOver && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isGameOver]);

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      {/* Clown car console view anchored to the corners */}
      <div className="hud-cockpit-row">
        <DashMeterPanel label="FEAR" percent={fearPercent} color={FEAR_METER_COLOR} side="left" />
        <DashMeterPanel label="DESPAIR" percent={despairPercent} color={DESPAIR_METER_COLOR} side="right" />
      </div>

      {/* Vignette - intensifies with combined insanity */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: `radial-gradient(circle at center, transparent ${50 - avgInsanity * 30}%, rgba(0,0,0,${0.8 + avgInsanity * 0.2}) 100%)`,
        }}
      />

      {/* Fear (Red) Overlay */}
      <div
        className="absolute inset-0 bg-red-900 transition-opacity duration-300 pointer-events-none"
        style={{ opacity: redOverlayOpacity }}
      />

      {/* Despair (Blue) Overlay */}
      <div
        className="absolute inset-0 bg-blue-900 transition-opacity duration-300 pointer-events-none"
        style={{ opacity: blueOverlayOpacity }}
      />

      {/* Perception Distortion at high insanity */}
      {avgInsanity > 0.5 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backdropFilter: `blur(${avgInsanity * 3}px) hue-rotate(${avgInsanity * 30}deg)`,
            animation: avgInsanity > 0.7 ? 'pulse 0.5s infinite' : 'none',
          }}
        />
      )}

      {/* Noise/Grain Overlay */}
      <div
        className="absolute inset-0 mix-blend-overlay pointer-events-none"
        style={{
          opacity: 0.03 + avgInsanity * 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Hint Button */}
      <HintButton />

      {/* Inverted Controls Warning */}
      <AnimatePresence>
        {isInverted && (
          <motion.div
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="font-horror text-4xl text-red-600 animate-pulse drop-shadow-[0_0_20px_rgba(139,0,0,0.8)]">
              REALITY BENDS
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High Fear Warning */}
      <AnimatePresence>
        {fear > 70 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-24 left-4 text-red-500 font-creepy text-lg animate-pulse"
          >
            THE UNKNOWN CONSUMES
          </motion.div>
        )}
      </AnimatePresence>

      {/* High Despair Warning */}
      <AnimatePresence>
        {despair > 70 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-24 right-4 text-blue-500 font-creepy text-lg animate-pulse"
          >
            YOU ARE LOST FOREVER
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-6 right-6 text-white/30 font-mono text-xs text-right">
        <p>TAP markers to move</p>
        <p>Find the EXIT to escape</p>
      </div>

      {/* Exploration Counter */}
      <div className="absolute bottom-6 left-6 text-white/40 font-mono text-xs">
        <p>CELLS: {cellsExplored}</p>
      </div>

      {/* WIN Overlay */}
      <AnimatePresence>
        {hasWon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-b from-green-900/90 to-black/90 flex flex-col items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <h1 className="font-horror text-6xl md:text-8xl text-green-400 mb-4">ESCAPED!</h1>
              <p className="text-white/70 font-creepy text-2xl text-center">
                You found your way out of the nightmare.
              </p>
              <p className="text-white/40 font-mono text-sm mt-8 text-center">
                Cells explored: {cellsExplored}
              </p>
              <p className="text-white/40 font-mono text-sm mt-2 text-center">
                Final sanity: {Math.floor(sanityLevel)}%
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GAME OVER - Beppo Video Climax */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50"
          >
            {/* Video plays first */}
            {!videoEnded && (
              <video
                ref={videoRef}
                src={beppoVideoUrl}
                className="absolute inset-0 w-full h-full object-cover"
                onEnded={handleVideoEnd}
                playsInline
                muted={false}
                style={{
                  filter: 'contrast(1.2) saturate(0.8)',
                }}
              />
            )}

            {/* Text appears after video */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: videoEnded ? 1 : 0,
                scale: videoEnded ? 1 : 0,
              }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="relative z-10 text-center"
            >
              <h1 className="font-horror text-6xl md:text-8xl text-red-600 mb-4 animate-pulse drop-shadow-[0_0_30px_rgba(139,0,0,0.8)]">
                BEPPO FOUND YOU
              </h1>
              <p className="text-white/60 font-creepy text-2xl text-center">
                You have joined the circus... forever.
              </p>
              <p className="text-white/30 font-mono text-sm mt-8 text-center">
                Cells explored: {cellsExplored}
              </p>
            </motion.div>

            {/* Kaleidoscopic overlay during video */}
            {!videoEnded && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 0.8, 1],
                }}
                transition={{
                  duration: 6,
                  ease: 'easeInOut',
                  repeat: 0,
                }}
                style={{
                  background: 'radial-gradient(circle, transparent 30%, rgba(139,0,0,0.3) 100%)',
                  mixBlendMode: 'overlay',
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
