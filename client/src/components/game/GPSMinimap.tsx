import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../game/store';

interface MinimapProps {
  size?: number;
}

/**
 * GPS-style minimap showing player's journey through the maze.
 * Features:
 * - Blinking red clown nose at current position
 * - Path thickness shows revisit count (despair visualization)
 * - Lines fade as sanity drops (memory loss)
 * - Canvas-based for smooth rendering
 */
export function GPSMinimap({ size = 150 }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pathHistory, currentNode, visitedCells, fear, despair, maxSanity } = useGameStore();
  const [blinkState, setBlinkState] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    if (pathHistory.length === 0) return;

    // Calculate bounds in a single pass
    if (pathHistory.length === 0) {
      const minX = 0;
      const maxX = 0;
      const minZ = 0;
      const maxZ = 0;
    } else {
      let minX = pathHistory[0].x;
      let maxX = pathHistory[0].x;
      let minZ = pathHistory[0].z;
      let maxZ = pathHistory[0].z;
      for (let i = 1; i < pathHistory.length; i++) {
        const p = pathHistory[i];
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.z < minZ) minZ = p.z;
        if (p.z > maxZ) maxZ = p.z;
      }
    }

    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;
    const maxRange = Math.max(rangeX, rangeZ);
    const padding = 10;
    const scale = (size - padding * 2) / maxRange;

    // Helper to convert maze coords to canvas coords
    const toCanvas = (x: number, z: number) => ({
      x: (x - minX) * scale + padding,
      y: (z - minZ) * scale + padding,
    });

    // Calculate memory fade based on average insanity
    const avgInsanity = maxSanity > 0 ? (fear + despair) / (2 * maxSanity) : 0;
    const baseOpacity = Math.max(0.2, 1 - avgInsanity * 0.7); // Fade as sanity drops

    // Draw path segments with thickness based on visit count
    for (let i = 1; i < pathHistory.length; i++) {
      const from = pathHistory[i - 1];
      const to = pathHistory[i];
      const fromCanvas = toCanvas(from.x, from.z);
      const toCanvasPos = toCanvas(to.x, to.z);

      // Get visit count for line thickness
      const toNodeId = `${to.x},${to.z}`;
      const visitCount = visitedCells.get(toNodeId)?.visitCount || 1;
      const lineWidth = Math.min(1 + visitCount * 0.5, 4); // Max thickness of 4

      // Memory fade - older segments fade more
      const ageFactor = i / pathHistory.length;
      const opacity = baseOpacity * (0.3 + ageFactor * 0.7);

      ctx.strokeStyle = `rgba(255, 100, 100, ${opacity})`;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(fromCanvas.x, fromCanvas.y);
      ctx.lineTo(toCanvasPos.x, toCanvasPos.y);
      ctx.stroke();
    }

    // Draw visited nodes as dots
    for (const [, cell] of visitedCells.entries()) {
      const point = toCanvas(cell.x, cell.z);

      // Dot size based on visit count
      const dotSize = Math.min(2 + cell.visitCount * 0.3, 5);

      ctx.fillStyle = `rgba(200, 50, 50, ${baseOpacity * 0.8})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw current position - blinking red clown nose
    if (currentNode) {
      const [xStr, zStr] = currentNode.split(',');
      const x = parseInt(xStr, 10);
      const z = parseInt(zStr, 10);
      const currentPos = toCanvas(x, z);

      // Blinking effect using state
      const blink = Math.sin(blinkState / 200) * 0.5 + 0.5; // 0 to 1

      // Outer glow
      const gradient = ctx.createRadialGradient(
        currentPos.x,
        currentPos.y,
        0,
        currentPos.x,
        currentPos.y,
        8,
      );
      gradient.addColorStop(0, `rgba(255, 0, 0, ${blink * 0.8})`);
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(currentPos.x, currentPos.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Red clown nose
      ctx.fillStyle = `rgba(255, 0, 0, ${0.9 + blink * 0.1})`;
      ctx.beginPath();
      ctx.arc(currentPos.x, currentPos.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // White highlight
      ctx.fillStyle = `rgba(255, 255, 255, ${blink * 0.6})`;
      ctx.beginPath();
      ctx.arc(currentPos.x - 1.5, currentPos.y - 1.5, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [pathHistory, currentNode, visitedCells, fear, despair, maxSanity, size, blinkState]);

  // Blink animation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkState(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 m-2 p-2 bg-black/60 border border-red-900/50 rounded backdrop-blur-sm">
        <div className="font-creepy text-red-500 text-xs mb-1 text-center">GPS</div>
        <canvas ref={canvasRef} width={size} height={size} className="border border-red-900/30" />
        <div className="font-mono text-red-400/60 text-xs mt-1 text-center">
          {visitedCells.size} nodes
        </div>
      </div>
    </div>
  );
}
