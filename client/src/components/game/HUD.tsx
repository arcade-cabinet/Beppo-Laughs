import { useGameStore } from '../../game/store';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainMeter } from './BrainMeter';

export function HUD() {
  const { fear, despair, maxSanity, isGameOver, visitedCells } = useGameStore();
  const isInverted = useGameStore(state => state.isInverted());
  const sanityLevel = useGameStore(state => state.getSanityLevel());
  
  // Calculate insanity effects
  const avgInsanity = (fear + despair) / 2 / maxSanity;
  const redOverlayOpacity = Math.min(fear / 300, 0.2);
  const blueOverlayOpacity = Math.min(despair / 300, 0.2);
  
  // Exploration stats
  const cellsExplored = visitedCells.size;

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      {/* Vignette - intensifies with combined insanity */}
      <div 
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: `radial-gradient(circle at center, transparent ${50 - avgInsanity * 30}%, rgba(0,0,0,${0.8 + avgInsanity * 0.2}) 100%)`
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
            animation: avgInsanity > 0.7 ? 'pulse 0.5s infinite' : 'none'
          }}
        />
      )}
      
      {/* Noise/Grain Overlay - intensifies with insanity */}
      <div 
        className="absolute inset-0 mix-blend-overlay pointer-events-none"
        style={{ 
          opacity: 0.03 + avgInsanity * 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      {/* 3D Brain Meter */}
      <BrainMeter />
      
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
        <p>WASD / Arrows to move</p>
        <p>Mouse to look</p>
        <p>Click to lock cursor</p>
      </div>
      
      {/* Exploration Counter */}
      <div className="absolute bottom-6 left-6 text-white/40 font-mono text-xs">
        <p>CELLS EXPLORED: {cellsExplored}</p>
        <p>SANITY: {Math.floor(sanityLevel)}%</p>
      </div>
      
      {/* Game Over Overlay */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              <h1 className="font-horror text-6xl md:text-8xl text-red-600 mb-4 animate-pulse">
                BEPPO FOUND YOU
              </h1>
              <p className="text-white/60 font-creepy text-2xl text-center">
                You have joined the circus... forever.
              </p>
              <p className="text-white/30 font-mono text-sm mt-8 text-center">
                Cells explored: {cellsExplored}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
