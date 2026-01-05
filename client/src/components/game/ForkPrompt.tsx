import { useGameStore } from '../../game/store';

export function ForkPrompt() {
  const { pendingFork, selectForkDirection, isGameOver, hasWon } = useGameStore();

  if (!pendingFork || isGameOver || hasWon) return null;

  const getHandPosition = (direction: 'north' | 'south' | 'east' | 'west') => {
    switch (direction) {
      case 'north':
        return 'top-1/3 left-1/2 -translate-x-1/2';
      case 'south':
        return 'bottom-1/3 left-1/2 -translate-x-1/2';
      case 'east':
        return 'top-1/2 right-8 -translate-y-1/2';
      case 'west':
        return 'top-1/2 left-8 -translate-y-1/2';
    }
  };

  const getRotation = (direction: 'north' | 'south' | 'east' | 'west') => {
    switch (direction) {
      case 'north':
        return 'rotate-0';
      case 'south':
        return 'rotate-180';
      case 'east':
        return 'rotate-90';
      case 'west':
        return '-rotate-90';
    }
  };

  const getLabel = (direction: 'north' | 'south' | 'east' | 'west', isExit: boolean) => {
    if (isExit) return 'EXIT!';
    switch (direction) {
      case 'north':
        return 'FORWARD';
      case 'south':
        return 'BACK';
      case 'east':
        return 'RIGHT';
      case 'west':
        return 'LEFT';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {pendingFork.options.map((option, _idx) => (
        <button
          key={option.nodeId}
          data-testid={`button-fork-${option.direction}`}
          onClick={() => selectForkDirection(option.nodeId)}
          className={`pointer-events-auto absolute ${getHandPosition(option.direction)}
                     w-24 h-24 flex flex-col items-center justify-center
                     transition-all duration-200 hover:scale-110 active:scale-95
                     animate-pulse`}
          style={{
            filter: 'drop-shadow(0 0 20px #ff69b4) drop-shadow(0 0 40px #ff1493)',
          }}
        >
          <div className={`text-7xl ${getRotation(option.direction)}`}>🖐️</div>
          <div
            className={`text-xs font-bold mt-1 px-2 py-1 rounded
                          ${option.isExit ? 'bg-green-500 text-white animate-bounce' : 'bg-pink-600/80 text-white'}`}
          >
            {getLabel(option.direction, option.isExit)}
          </div>
        </button>
      ))}

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      text-center pointer-events-none"
      >
        <div
          className="text-pink-400 text-xl font-bold animate-pulse 
                        drop-shadow-lg"
          style={{ textShadow: '0 0 10px #ff69b4' }}
        >
          CHOOSE YOUR PATH!
        </div>
        <div className="text-pink-300 text-sm mt-2">Tap a glowing hand</div>
      </div>
    </div>
  );
}
