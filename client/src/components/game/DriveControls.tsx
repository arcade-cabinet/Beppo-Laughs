import { useCallback } from 'react';
import { useGameStore } from '../../game/store';

export function DriveControls() {
  const { setAccelerating, setBraking, carSpeed, pendingFork, isGameOver, hasWon } = useGameStore();

  const handleAcceleratorStart = useCallback(() => {
    if (isGameOver || hasWon || pendingFork) return;
    setAccelerating(true);
  }, [setAccelerating, isGameOver, hasWon, pendingFork]);

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

  if (isGameOver || hasWon) return null;

  const speedPercent = (Math.abs(carSpeed) / 5) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Brake Pedal (Left) - Clown Shoe Style */}
      <button
        data-testid="button-brake"
        className="pointer-events-auto absolute left-4 bottom-8 w-28 h-40 
                   flex flex-col items-center justify-end pb-4
                   touch-none select-none transition-transform
                   active:scale-95"
        onMouseDown={handleBrakeStart}
        onMouseUp={handleBrakeEnd}
        onMouseLeave={handleBrakeEnd}
        onTouchStart={handleBrakeStart}
        onTouchEnd={handleBrakeEnd}
        style={{
          background: 'linear-gradient(135deg, #cc2200 0%, #8b0000 50%, #660000 100%)',
          borderRadius: '20px 20px 40px 40px',
          border: '4px solid #4a0000',
          boxShadow: '0 8px 20px rgba(0,0,0,0.5), inset 0 -5px 15px rgba(0,0,0,0.3)',
        }}
      >
        <div className="text-white font-bold text-lg tracking-wider drop-shadow-lg">BRAKE</div>
        <div className="text-5xl mt-2" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
          🛑
        </div>
        {/* Shoe toe bulge */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-8 rounded-b-full"
          style={{ background: 'linear-gradient(to bottom, #8b0000, #660000)' }}
        />
      </button>

      {/* Accelerator Pedal (Right) - Clown Shoe Style */}
      <button
        data-testid="button-accelerate"
        disabled={!!pendingFork}
        className={`pointer-events-auto absolute right-4 bottom-8 w-28 h-40 
                   flex flex-col items-center justify-end pb-4
                   touch-none select-none transition-transform
                   ${pendingFork ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
        onMouseDown={handleAcceleratorStart}
        onMouseUp={handleAcceleratorEnd}
        onMouseLeave={handleAcceleratorEnd}
        onTouchStart={handleAcceleratorStart}
        onTouchEnd={handleAcceleratorEnd}
        style={{
          background: pendingFork
            ? 'linear-gradient(135deg, #666 0%, #444 50%, #333 100%)'
            : 'linear-gradient(135deg, #22cc22 0%, #008800 50%, #006600 100%)',
          borderRadius: '20px 20px 40px 40px',
          border: `4px solid ${pendingFork ? '#222' : '#004400'}`,
          boxShadow: '0 8px 20px rgba(0,0,0,0.5), inset 0 -5px 15px rgba(0,0,0,0.3)',
        }}
      >
        <div className="text-white font-bold text-lg tracking-wider drop-shadow-lg">GAS</div>
        <div className="text-5xl mt-2" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
          ⚡
        </div>
        {/* Shoe toe bulge */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-8 rounded-b-full"
          style={{
            background: pendingFork ? '#333' : 'linear-gradient(to bottom, #008800, #006600)',
          }}
        />
      </button>

      {/* Speed Indicator - Speedometer Style */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div
          className="relative w-36 h-20 rounded-t-full overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1a1510 0%, #2a2520 100%)',
            border: '3px solid #8b4513',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          {/* Speed arc background */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-14 rounded-t-full"
            style={{ background: 'linear-gradient(to right, #004400, #888800, #880000)' }}
          />

          {/* Speed needle */}
          <div
            className="absolute bottom-1 left-1/2 w-1 h-12 origin-bottom transition-transform duration-100"
            style={{
              background: 'linear-gradient(to top, #ff4400, #ffcc00)',
              transform: `translateX(-50%) rotate(${-90 + speedPercent * 1.8}deg)`,
              boxShadow: '0 0 10px #ff4400',
            }}
          />

          {/* Center hub */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
            style={{ background: '#ffcc00', boxShadow: '0 0 8px #ffcc00' }}
          />

          {/* SPEED label */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-amber-400 text-xs font-bold">
            SPEED
          </div>
        </div>
      </div>

      {/* Instruction when at fork */}
      {pendingFork && (
        <div className="absolute bottom-52 left-1/2 -translate-x-1/2 text-center">
          <div className="text-amber-400 text-sm font-bold animate-pulse">
            Choose a direction first!
          </div>
        </div>
      )}
    </div>
  );
}
