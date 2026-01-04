import { useGameStore } from '../../game/store';
import { motion, AnimatePresence } from 'framer-motion';

export function HUD() {
  const { fear, isInverted } = useGameStore();
  
  // Fear level affects visual intensity
  const pulseIntensity = fear > 50 ? 'animate-pulse' : '';
  const redOverlayOpacity = Math.min(fear / 200, 0.3); // Max 30% red overlay

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      {/* Vignette - intensifies with fear */}
      <div 
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: `radial-gradient(circle at center, transparent ${50 - fear / 3}%, rgba(0,0,0,${0.8 + fear / 200}) 100%)`
        }}
      />
      
      {/* Blood Red Overlay when fear is high */}
      <div 
        className="absolute inset-0 bg-red-900 transition-opacity duration-300 pointer-events-none"
        style={{ opacity: redOverlayOpacity }}
      />
      
      {/* Noise/Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      {/* Fear Meter */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2">
        <div className="text-white/70 font-mono text-xs uppercase tracking-widest">
          Fear
        </div>
        <div className="w-32 h-3 bg-black/50 border border-white/20 rounded-sm overflow-hidden">
          <motion.div 
            className={`h-full ${pulseIntensity}`}
            style={{ 
              width: `${fear}%`,
              background: fear > 70 
                ? 'linear-gradient(90deg, #8b0000, #ff0000)' 
                : fear > 40 
                  ? 'linear-gradient(90deg, #4a0000, #8b0000)'
                  : 'linear-gradient(90deg, #2d4a2b, #4a5f4a)'
            }}
            animate={{ width: `${fear}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
        
        {/* Warning Text */}
        <AnimatePresence>
          {fear > 70 && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-500 font-creepy text-sm animate-pulse"
            >
              CONTROLS UNSTABLE
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
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
              BEPPO LAUGHS
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-6 right-6 text-white/30 font-mono text-xs text-right">
        <p>WASD / Arrows to move</p>
        <p>Mouse to look</p>
        <p>Click to lock cursor</p>
      </div>
      
      {/* Seed Display */}
      <div className="absolute top-4 left-4 text-white/20 font-mono text-xs">
        SURVIVE THE MAZE
      </div>
    </div>
  );
}
