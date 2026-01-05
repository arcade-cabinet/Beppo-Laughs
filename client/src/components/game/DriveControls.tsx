import { useCallback, useRef, useEffect } from 'react';
import { useGameStore } from '../../game/store';

export function DriveControls() {
  const { 
    setAccelerating, 
    setBraking, 
    setSteeringAngle,
    isGameOver,
    hasWon 
  } = useGameStore();
  
  const steeringRef = useRef<HTMLDivElement>(null);
  const isDraggingWheel = useRef(false);
  const wheelCenterX = useRef(0);
  
  const handleAcceleratorStart = useCallback(() => {
    if (isGameOver || hasWon) return;
    setAccelerating(true);
  }, [setAccelerating, isGameOver, hasWon]);
  
  const handleAcceleratorEnd = useCallback(() => {
    setAccelerating(false);
  }, [setAccelerating]);
  
  const handleBrakeStart = useCallback(() => {
    if (isGameOver || hasWon) return;
    setBraking(true);
  }, [setBraking, isGameOver, hasWon]);
  
  const handleBrakeEnd = useCallback(() => {
    setBraking(false);
  }, [setBraking]);
  
  const handleSteeringStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (isGameOver || hasWon) return;
    isDraggingWheel.current = true;
    
    if (steeringRef.current) {
      const rect = steeringRef.current.getBoundingClientRect();
      wheelCenterX.current = rect.left + rect.width / 2;
    }
  }, [isGameOver, hasWon]);
  
  const handleSteeringMove = useCallback((clientX: number) => {
    if (!isDraggingWheel.current) return;
    
    const offset = clientX - wheelCenterX.current;
    const maxOffset = 100;
    const normalizedSteering = Math.max(-1, Math.min(1, offset / maxOffset));
    
    setSteeringAngle(normalizedSteering);
  }, [setSteeringAngle]);
  
  const handleSteeringEnd = useCallback(() => {
    isDraggingWheel.current = false;
    setSteeringAngle(0);
  }, [setSteeringAngle]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleSteeringMove(e.clientX);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleSteeringMove(e.touches[0].clientX);
      }
    };
    
    const handleEnd = () => {
      if (isDraggingWheel.current) {
        handleSteeringEnd();
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [handleSteeringMove, handleSteeringEnd]);
  
  if (isGameOver || hasWon) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Brake Pedal (Left) */}
      <button
        data-testid="button-brake"
        className="pointer-events-auto absolute left-4 bottom-8 w-20 h-32 rounded-lg 
                   bg-gradient-to-b from-red-600 to-red-800 border-4 border-red-900
                   active:from-red-700 active:to-red-900 active:scale-95
                   shadow-lg transition-transform touch-none select-none"
        onMouseDown={handleBrakeStart}
        onMouseUp={handleBrakeEnd}
        onMouseLeave={handleBrakeEnd}
        onTouchStart={handleBrakeStart}
        onTouchEnd={handleBrakeEnd}
      >
        <div className="text-white font-bold text-sm text-center mt-2">BRAKE</div>
        <div className="text-6xl text-center mt-2">🛑</div>
      </button>
      
      {/* Accelerator Pedal (Right) */}
      <button
        data-testid="button-accelerate"
        className="pointer-events-auto absolute right-4 bottom-8 w-20 h-32 rounded-lg 
                   bg-gradient-to-b from-green-500 to-green-700 border-4 border-green-900
                   active:from-green-600 active:to-green-800 active:scale-95
                   shadow-lg transition-transform touch-none select-none"
        onMouseDown={handleAcceleratorStart}
        onMouseUp={handleAcceleratorEnd}
        onMouseLeave={handleAcceleratorEnd}
        onTouchStart={handleAcceleratorStart}
        onTouchEnd={handleAcceleratorEnd}
      >
        <div className="text-white font-bold text-sm text-center mt-2">GAS</div>
        <div className="text-6xl text-center mt-2">⚡</div>
      </button>
      
      {/* Steering Wheel Control (Bottom Center) */}
      <div
        ref={steeringRef}
        data-testid="control-steering"
        className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 
                   w-40 h-20 rounded-full bg-amber-900/80 border-4 border-amber-700
                   flex items-center justify-center cursor-grab active:cursor-grabbing
                   touch-none select-none"
        onMouseDown={handleSteeringStart}
        onTouchStart={handleSteeringStart}
      >
        <div className="text-amber-200 font-bold text-center">
          <div className="text-xs">← STEER →</div>
          <div className="text-2xl">🎡</div>
        </div>
        
        {/* Left arrow indicator */}
        <div className="absolute left-2 text-2xl text-amber-300">◀</div>
        
        {/* Right arrow indicator */}
        <div className="absolute right-2 text-2xl text-amber-300">▶</div>
      </div>
      
      {/* Speed indicator */}
      <SpeedIndicator />
    </div>
  );
}

function SpeedIndicator() {
  const { carSpeed } = useGameStore();
  
  const speedPercent = Math.abs(carSpeed) / 5 * 100;
  
  return (
    <div className="absolute bottom-44 left-1/2 -translate-x-1/2 text-center">
      <div className="text-amber-400 font-mono text-sm mb-1">SPEED</div>
      <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden border border-amber-600">
        <div 
          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-100"
          style={{ width: `${speedPercent}%` }}
        />
      </div>
    </div>
  );
}
