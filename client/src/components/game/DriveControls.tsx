import { useCallback, useState } from 'react';
import { useGameStore } from '../../game/store';

export function DriveControls() {
  const {
    setAccelerating,
    setBraking,
    accelerating,
    carSpeed,
    pendingFork,
    isGameOver,
    hasWon
  } = useGameStore();
  const [showLeverHint, setShowLeverHint] = useState(true);

  const leverDisabled = pendingFork;

  const handleLeverPullStart = useCallback(() => {
    if (leverDisabled) return;
    setAccelerating(true);
    setShowLeverHint(false);
  }, [leverDisabled, setAccelerating]);

  const handleLeverPullEnd = useCallback(() => {
    setAccelerating(false);
    setBraking(false);
  }, [setAccelerating, setBraking]);
  
  if (isGameOver || hasWon) return null;

  const speedPercent = (Math.abs(carSpeed) / 5) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        {showLeverHint && (
          <div className="flex flex-col items-center text-amber-300 text-sm font-bold drop-shadow-lg animate-bounce">
            <span className="text-lg">⬇️</span>
            <span>Pull the lever!</span>
          </div>
        )}
        <button
          type="button"
          data-testid="lever-control"
          disabled={leverDisabled}
          aria-label="Drive lever - hold to accelerate"
          aria-pressed={accelerating}
          aria-disabled={leverDisabled}
          className={`relative w-28 h-40 flex flex-col items-center justify-end select-none touch-none transition-transform ${leverDisabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
          onMouseDown={handleLeverPullStart}
          onMouseUp={handleLeverPullEnd}
          onMouseLeave={handleLeverPullEnd}
          onTouchStart={handleLeverPullStart}
          onTouchEnd={handleLeverPullEnd}
          onTouchCancel={handleLeverPullEnd}
          style={{
            background: 'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.12), transparent 45%), linear-gradient(180deg, #1f130a 0%, #2e1b0e 100%)',
            borderRadius: '18px',
            border: '3px solid #4b2a12',
            boxShadow: '0 10px 25px rgba(0,0,0,0.45), inset 0 2px 8px rgba(0,0,0,0.4)'
          }}
        >
          {/* Lever base */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full" style={{ background: 'linear-gradient(90deg, #3b1c0a, #6a3414, #3b1c0a)' }} />
          {/* Lever arm */}
          <div
            className="absolute bottom-9 left-1/2 -translate-x-1/2 origin-bottom"
            style={{
              width: '12px',
              height: '110px',
              borderRadius: '10px',
              background: leverDisabled ? 'linear-gradient(180deg, #666, #444)' : 'linear-gradient(180deg, #e0a000, #d45b00)',
              boxShadow: leverDisabled ? '0 0 8px rgba(0,0,0,0.6)' : '0 0 12px rgba(255,132,0,0.35)',
              transform: `translateX(-50%) rotate(${accelerating ? 0 : '-12deg'})`
            }}
          >
            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full"
              style={{
                background: leverDisabled ? 'radial-gradient(circle at 35% 35%, #ffbbbb, #bb4444)' : 'radial-gradient(circle at 35% 35%, #ffdddd, #dd0000)',
                boxShadow: leverDisabled ? '0 0 12px rgba(0,0,0,0.5)' : '0 0 18px rgba(255,0,0,0.45), 0 6px 12px rgba(0,0,0,0.4)',
              }}
            />
          </div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-amber-300 font-bold text-lg drop-shadow-lg">
            DRIVE
          </div>
        </button>
      </div>
      
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
