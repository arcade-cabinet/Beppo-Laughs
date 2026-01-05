import { useGameStore } from '../../game/store';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainMeter } from './BrainMeter';
import { useRef, useEffect, useState, useMemo } from 'react';
import beppoVideoUrl from '@assets/generated_videos/beppo_clown_emerging_laughing_game_over.mp4';
import seedrandom from 'seedrandom';

function DebugInfo() {
  const { currentNode, isMoving, targetNode } = useGameStore();
  return (
    <div className="mt-2 text-yellow-400/60">
      <p>NODE: {currentNode}</p>
      <p>MOVING: {isMoving ? `→ ${targetNode}` : 'no'}</p>
    </div>
  );
}

function Minimap() {
  const { visitedCells, currentNode, despair, maxSanity, pathHistory, isGameOver, hasWon } = useGameStore();
  
  const despairRatio = despair / maxSanity;
  
  const visibleCells = useMemo(() => {
    if (visitedCells.size === 0) return [];
    
    const cells = Array.from(visitedCells.entries());
    
    if (despairRatio < 0.3) return cells;
    
    const rng = seedrandom(`despair-${Math.floor(despairRatio * 10)}`);
    const keepRatio = 1 - (despairRatio - 0.3) * 1.2;
    
    return cells.filter(() => rng() < Math.max(0.2, keepRatio));
  }, [visitedCells, despairRatio]);
  
  const connections = useMemo(() => {
    const conns: Array<{ from: string; to: string }> = [];
    const seen = new Set<string>();
    
    for (let i = 1; i < pathHistory.length; i++) {
      const from = `${pathHistory[i-1].x},${pathHistory[i-1].z}`;
      const to = `${pathHistory[i].x},${pathHistory[i].z}`;
      const key = [from, to].sort().join('-');
      
      if (!seen.has(key)) {
        seen.add(key);
        conns.push({ from, to });
      }
    }
    
    if (despairRatio < 0.2) return conns;
    
    const rng = seedrandom(`conn-${Math.floor(despairRatio * 10)}`);
    const keepRatio = 1 - (despairRatio - 0.2) * 1.0;
    
    return conns.filter(() => rng() < Math.max(0.1, keepRatio));
  }, [pathHistory, despairRatio]);
  
  const bounds = useMemo(() => {
    if (visibleCells.length === 0) return { minX: 0, maxX: 12, minY: 0, maxY: 12 };
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    for (const [key] of visibleCells) {
      const [xStr, yStr] = key.split(',');
      const x = parseInt(xStr);
      const y = parseInt(yStr);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    
    return { minX: minX - 1, maxX: maxX + 1, minY: minY - 1, maxY: maxY + 1 };
  }, [visibleCells]);
  
  if (isGameOver || hasWon) return null;
  
  const mapSize = 140;
  const cellSize = mapSize / Math.max(bounds.maxX - bounds.minX + 1, bounds.maxY - bounds.minY + 1);
  
  const getPos = (key: string) => {
    const [xStr, yStr] = key.split(',');
    const x = parseInt(xStr);
    const y = parseInt(yStr);
    return {
      x: (x - bounds.minX) * cellSize,
      y: (y - bounds.minY) * cellSize
    };
  };
  
  const currentPos = currentNode ? getPos(currentNode) : null;
  
  return (
    <div 
      className="absolute top-4 right-4 pointer-events-none"
      style={{
        filter: despairRatio > 0.5 
          ? `blur(${(despairRatio - 0.5) * 4}px) saturate(${1 - despairRatio * 0.5})` 
          : 'none',
        opacity: despairRatio > 0.8 ? 0.5 : 1
      }}
    >
      <div 
        className="relative rounded-lg border-2 border-amber-800/60 bg-black/40 backdrop-blur-sm overflow-hidden"
        style={{ width: mapSize + 16, height: mapSize + 16 }}
      >
        <div className="absolute inset-2">
          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full">
            {connections.map(({ from, to }, idx) => {
              const fromPos = getPos(from);
              const toPos = getPos(to);
              return (
                <line
                  key={idx}
                  x1={fromPos.x + cellSize/2}
                  y1={fromPos.y + cellSize/2}
                  x2={toPos.x + cellSize/2}
                  y2={toPos.y + cellSize/2}
                  stroke="#c4a878"
                  strokeWidth={2}
                  strokeOpacity={0.6}
                />
              );
            })}
          </svg>
          
          {/* Visited cells */}
          {visibleCells.map(([key, cell]) => {
            const pos = getPos(key);
            const isCurrentCell = key === currentNode;
            
            return (
              <div
                key={key}
                className={`absolute rounded-sm ${
                  isCurrentCell 
                    ? 'bg-yellow-400 animate-pulse' 
                    : 'bg-amber-700/60'
                }`}
                style={{
                  left: pos.x + 2,
                  top: pos.y + 2,
                  width: cellSize - 4,
                  height: cellSize - 4,
                }}
              />
            );
          })}
          
          {/* Current position marker */}
          {currentPos && (
            <div
              className="absolute w-2 h-2 bg-white rounded-full animate-ping"
              style={{
                left: currentPos.x + cellSize/2 - 4,
                top: currentPos.y + cellSize/2 - 4,
              }}
            />
          )}
        </div>
        
        {/* Despair corruption overlay */}
        {despairRatio > 0.4 && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${50 + Math.sin(Date.now()/1000) * 20}% ${50 + Math.cos(Date.now()/1000) * 20}%, transparent, rgba(0,0,139,${despairRatio * 0.3}))`,
            }}
          />
        )}
      </div>
      
      <div className="text-center mt-1 text-xs text-amber-600/80 font-mono">
        {despairRatio > 0.6 ? '???' : 'MAP'}
      </div>
    </div>
  );
}


export function HUD() {
  const { fear, despair, maxSanity, isGameOver, hasWon, visitedCells } = useGameStore();
  const isInverted = useGameStore(state => state.isInverted());
  const sanityLevel = useGameStore(state => state.getSanityLevel());
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  
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
      
      {/* Noise/Grain Overlay */}
      <div 
        className="absolute inset-0 mix-blend-overlay pointer-events-none"
        style={{ 
          opacity: 0.03 + avgInsanity * 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      {/* 3D Brain Meter */}
      <BrainMeter />
      
      {/* Minimap */}
      <Minimap />
      
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
      
      {/* Exploration Counter + Debug Info */}
      <div className="absolute bottom-6 left-6 text-white/40 font-mono text-xs">
        <p>CELLS EXPLORED: {cellsExplored}</p>
        <p>SANITY: {Math.floor(sanityLevel)}%</p>
        <DebugInfo />
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
              <h1 className="font-horror text-6xl md:text-8xl text-green-400 mb-4">
                ESCAPED!
              </h1>
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
                  filter: 'contrast(1.2) saturate(0.8)'
                }}
              />
            )}
            
            {/* Text appears after video */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: videoEnded ? 1 : 0, 
                scale: videoEnded ? 1 : 0 
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
                  scale: [1, 1.2, 0.8, 1]
                }}
                transition={{ 
                  duration: 6, 
                  ease: "easeInOut",
                  repeat: 0
                }}
                style={{
                  background: 'radial-gradient(circle, transparent 30%, rgba(139,0,0,0.3) 100%)',
                  mixBlendMode: 'overlay'
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
