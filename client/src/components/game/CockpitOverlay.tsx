import { useGameStore } from '../../game/store';
import { GPSMinimap } from './GPSMinimap';

/**
 * HTML/CSS-based cockpit overlay - acts as a fixed viewport frame.
 * This is NOT 3D - it's just a themed border like an arcade cabinet.
 *
 * Think of it as the physical art around an arcade screen - it never moves,
 * only the game world behind it flows past.
 */
export function CockpitOverlay() {
  const { fear, despair, maxSanity, pendingFork, selectForkDirection } = useGameStore();

  const fearPercent = maxSanity > 0 ? (fear / maxSanity) * 100 : 0;
  const despairPercent = maxSanity > 0 ? (despair / maxSanity) * 100 : 0;

  const handleStartClick = () => {
    if (pendingFork && pendingFork.options.length > 0) {
      // Auto-select first available direction to start movement
      selectForkDirection(pendingFork.options[0].nodeId);
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {/* GPS Minimap - Top Right */}
      <GPSMinimap size={150} />

      {/* Dashboard at bottom - ALWAYS visible */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">

          {/* Fear Gauge - Left */}
          <div className="w-40">
            <div className="font-creepy text-red-500 text-sm mb-1">FEAR</div>
            <div className="h-6 bg-black/50 border border-red-900/50 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-900 to-red-500 transition-all duration-300"
                style={{
                  width: `${fearPercent}%`,
                  boxShadow: fearPercent > 50 ? '0 0 10px rgba(220, 38, 38, 0.6)' : 'none'
                }}
              />
            </div>
            <div className="font-mono text-red-400/60 text-xs mt-1">{Math.round(fearPercent)}%</div>
          </div>

          {/* Center - START Button */}
          <button
            type="button"
            onClick={handleStartClick}
            disabled={!pendingFork}
            className={`pointer-events-auto flex flex-col items-center transition-all duration-200
                       ${pendingFork ? 'cursor-pointer hover:scale-110 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-b from-red-600 to-red-800 border-4 border-red-900 flex items-center justify-center
                           ${pendingFork ? 'animate-pulse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-red-500" />
            </div>
            <div className="font-creepy text-white/40 text-xs mt-1">START</div>
          </button>

          {/* Despair Gauge - Right */}
          <div className="w-40">
            <div className="font-creepy text-blue-500 text-sm mb-1 text-right">DESPAIR</div>
            <div className="h-6 bg-black/50 border border-blue-900/50 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-900 transition-all duration-300 ml-auto"
                style={{
                  width: `${despairPercent}%`,
                  boxShadow: despairPercent > 50 ? '0 0 10px rgba(59, 130, 246, 0.6)' : 'none'
                }}
              />
            </div>
            <div className="font-mono text-blue-400/60 text-xs mt-1 text-right">{Math.round(despairPercent)}%</div>
          </div>
        </div>
      </div>

      {/* Hood overlay - Hidden on mobile, visible on desktop */}
      <div className="hidden md:block absolute bottom-0 left-0 right-0 h-48 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 via-transparent to-transparent" />

        {/* Rusty hood edge */}
        <div className="absolute bottom-32 left-0 right-0 h-8 bg-gradient-to-b from-orange-800/40 to-transparent"
             style={{ clipPath: 'polygon(0 50%, 5% 0, 95% 0, 100% 50%, 95% 100%, 5% 100%)' }}
        />
      </div>
    </div>
  );
}
