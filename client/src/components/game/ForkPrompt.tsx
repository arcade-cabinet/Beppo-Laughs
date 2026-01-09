import { useGameStore } from '../../game/store';

// Helper functions moved outside component to avoid recreation on every render
const getDirectionAngle = (gridDirection: 'north' | 'south' | 'east' | 'west'): number => {
  // Grid direction to world angle (matching RailPlayer's calculation)
  // North=0, East=-90 (-PI/2), South=180 (PI), West=90 (PI/2)
  switch (gridDirection) {
    case 'north':
      return 0; // Looking down -Z
    case 'east':
      return -Math.PI / 2; // Looking down +X (Physically Right)
    case 'south':
      return Math.PI; // Looking down +Z
    case 'west':
      return Math.PI / 2; // Looking down -X (Physically Left)
  }
};

const getCameraRelativeDirection = (
  gridDirection: 'north' | 'south' | 'east' | 'west',
  cameraRotation: number,
): 'forward' | 'back' | 'left' | 'right' => {
  const targetAngle = getDirectionAngle(gridDirection);
  let relativeAngle = targetAngle - cameraRotation;

  // Normalize to [-π, π]
  while (relativeAngle > Math.PI) relativeAngle -= Math.PI * 2;
  while (relativeAngle < -Math.PI) relativeAngle += Math.PI * 2;

  // Determine direction based on relative angle
  const absAngle = Math.abs(relativeAngle);
  if (absAngle < Math.PI / 4) return 'forward';
  if (absAngle > (3 * Math.PI) / 4) return 'back';

  // With North=0, East=-PI/2 (Right), West=PI/2 (Left)
  // If target is East (-PI/2) and Camera is North (0). Relative = -PI/2.
  // We want 'right'. So Negative is Right.
  // If target is West (PI/2) and Camera is North (0). Relative = PI/2.
  // We want 'left'. So Positive is Left.
  return relativeAngle > 0 ? 'left' : 'right';
};

const getHandPosition = (relativeDir: 'forward' | 'back' | 'left' | 'right'): string => {
  switch (relativeDir) {
    case 'forward':
      return 'top-1/3 left-1/2 -translate-x-1/2';
    case 'back':
      return 'bottom-1/3 left-1/2 -translate-x-1/2';
    case 'right':
      return 'top-1/2 right-8 -translate-y-1/2';
    case 'left':
      return 'top-1/2 left-8 -translate-y-1/2';
  }
};

const getRotation = (relativeDir: 'forward' | 'back' | 'left' | 'right'): string => {
  switch (relativeDir) {
    case 'forward':
      return 'rotate-0';
    case 'back':
      return 'rotate-180';
    case 'right':
      return 'rotate-90';
    case 'left':
      return '-rotate-90';
  }
};

const getLabel = (relativeDir: 'forward' | 'back' | 'left' | 'right', isExit: boolean): string => {
  if (isExit) return 'EXIT!';
  return relativeDir.toUpperCase();
};

// Static style constant to avoid recreation on every render
const HAND_GLOW_STYLE = {
  filter: 'drop-shadow(0 0 20px #ff69b4) drop-shadow(0 0 40px #ff1493)',
} as const;

export function ForkPrompt() {
  const { pendingFork, selectForkDirection, isGameOver, hasWon, cameraRotation } = useGameStore();

  if (!pendingFork || isGameOver || hasWon) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40" data-has-fork="true">
      {pendingFork.options.map((option) => {
        const relativeDir = getCameraRelativeDirection(option.direction, cameraRotation);
        return (
          <button
            key={option.nodeId}
            type="button"
            data-testid={`button-fork-${option.direction}`}
            onClick={() => selectForkDirection(option.nodeId)}
            className={`pointer-events-auto absolute ${getHandPosition(relativeDir)}
                       w-24 h-24 flex flex-col items-center justify-center
                       transition-all duration-200 hover:scale-110 active:scale-95
                       animate-pulse`}
            style={HAND_GLOW_STYLE}
          >
            <div className={`text-7xl ${getRotation(relativeDir)}`}>🖐️</div>
            <div
              className={`text-xs font-bold mt-1 px-2 py-1 rounded
                            ${option.isExit ? 'bg-green-500 text-white animate-bounce' : 'bg-pink-600/80 text-white'}`}
            >
              {getLabel(relativeDir, option.isExit)}
            </div>
          </button>
        );
      })}

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      text-center pointer-events-none"
      >
        <div className="text-white/80 font-creepy text-2xl mb-2 drop-shadow-lg">
          CHOOSE YOUR PATH
        </div>
        <div className="text-white/60 font-mono text-sm uppercase tracking-wider">
          Click a hand to proceed
        </div>
      </div>
    </div>
  );
}
