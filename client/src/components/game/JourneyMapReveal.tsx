import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useGameStore } from '../../game/store';

/**
 * Full-screen journey map revealed at game over.
 * Shows the complete path the player took through the maze,
 * with visual emphasis on areas that caused fear/despair.
 */
export function JourneyMapReveal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pathHistory, visitedCells, isGameOver, hasWon, fear, despair } = useGameStore();

  const shouldShow = isGameOver || hasWon;

  useEffect(() => {
    if (!shouldShow) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      // Use full canvas size
      const size = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.6);
      canvas.width = size;
      canvas.height = size;
      drawMap(canvas);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial draw

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [shouldShow, pathHistory, visitedCells, hasWon]);

  const drawMap = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    if (pathHistory.length === 0) return;

    // Calculate bounds to scale the map using single-pass reduce
    const { minX, maxX, minZ, maxZ } = pathHistory.reduce(
      (acc, p) => ({
        minX: Math.min(acc.minX, p.x),
        maxX: Math.max(acc.maxX, p.x),
        minZ: Math.min(acc.minZ, p.z),
        maxZ: Math.max(acc.maxZ, p.z),
      }),
      { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity },
    );

    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;
    const maxRange = Math.max(rangeX, rangeZ);
    const padding = 40;
    const scale = (size - padding * 2) / maxRange;

    // Helper to convert maze coords to canvas coords
    const toCanvas = (x: number, z: number) => ({
      x: (x - minX) * scale + padding,
      y: (z - minZ) * scale + padding,
    });

    // Draw path segments with color coding based on fear/despair
    for (let i = 1; i < pathHistory.length; i++) {
      const from = pathHistory[i - 1];
      const to = pathHistory[i];
      const fromCanvas = toCanvas(from.x, from.z);
      const toCanvasPos = toCanvas(to.x, to.z);

      // Get visit count for line thickness
      const toNodeId = `${to.x},${to.z}`;
      const toCell = visitedCells.get(toNodeId);
      const visitCount = toCell?.visitCount || 1;
      const lineWidth = Math.min(2 + visitCount * 0.8, 8);

      // Color based on whether it was a new discovery (fear) or retread (despair)
      const isRetread = visitCount > 1;
      const color = isRetread
        ? `rgba(59, 130, 246, ${0.6 + visitCount * 0.1})` // Blue for despair
        : `rgba(220, 38, 38, 0.8)`; // Red for fear

      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(fromCanvas.x, fromCanvas.y);
      ctx.lineTo(toCanvasPos.x, toCanvasPos.y);
      ctx.stroke();
    }

    // Draw start position (green)
    if (pathHistory.length > 0) {
      const start = pathHistory[0];
      const startPos = toCanvas(start.x, start.z);

      ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // "START" label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('START', startPos.x, startPos.y - 15);
    }

    // Draw end position (red or gold depending on outcome)
    if (pathHistory.length > 0) {
      const end = pathHistory[pathHistory.length - 1];
      const endPos = toCanvas(end.x, end.z);

      ctx.fillStyle = hasWon ? 'rgba(234, 179, 8, 0.9)' : 'rgba(220, 38, 38, 0.9)';
      ctx.beginPath();
      ctx.arc(endPos.x, endPos.y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(hasWon ? 'ESCAPED!' : 'CAUGHT', endPos.x, endPos.y + 25);
    }

    // Draw visited nodes as dots (smaller than minimap)
    for (const [, cell] of visitedCells) {
      const point = toCanvas(cell.x, cell.z);
      const dotSize = Math.min(3 + cell.visitCount * 0.4, 7);

      const isRetread = cell.visitCount > 1;
      ctx.fillStyle = isRetread ? 'rgba(59, 130, 246, 0.6)' : 'rgba(220, 38, 38, 0.6)';

      ctx.beginPath();
      ctx.arc(point.x, point.y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  if (!shouldShow) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: hasWon ? 0.5 : 2, duration: 1 }}
      className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: hasWon ? 0.8 : 2.3, duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <h2 className="font-horror text-3xl md:text-4xl text-white/90 mb-4 text-center">
          YOUR JOURNEY THROUGH THE NIGHTMARE
        </h2>

        <div className="relative bg-black/80 p-6 rounded-lg border-2 border-red-900/50">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Journey map showing ${pathHistory.length} steps through ${visitedCells.size} cells. ${hasWon ? 'You escaped!' : 'You were caught.'}`}
            tabIndex={0}
            className="max-w-full max-h-full"
            style={{ imageRendering: 'crisp-edges' }}
          />

          {/* Legend */}
          <div className="mt-4 flex justify-center gap-6 text-sm font-mono">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded-full" />
              <span className="text-red-400">New Paths (Fear)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full" />
              <span className="text-blue-400">Retreaded Paths (Despair)</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 text-center text-white/70 font-mono text-sm">
            <div>Cells Explored: {visitedCells.size}</div>
            <div>Total Steps: {pathHistory.length}</div>
            <div className="mt-2">
              <span className="text-red-400">Fear: {fear}</span>
              {' | '}
              <span className="text-blue-400">Despair: {despair}</span>
            </div>
          </div>
        </div>

        <p className="text-white/50 font-creepy text-sm mt-6 text-center max-w-md">
          {hasWon
            ? 'You navigated the nightmare and found your way out. But the memories will haunt you forever...'
            : "You wandered too deep into the madness. Beppo's laughter echoes through your mind..."}
        </p>
      </motion.div>
    </motion.div>
  );
}
