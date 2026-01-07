import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../../game/store';

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export function GestureControls() {
  const { availableMoves, isMoving, startMoveTo, cameraRotation, setCameraRotation } =
    useGameStore();

  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchHistoryRef = useRef<TouchPoint[]>([]);
  const isGestureRef = useRef(false);

  const handleSwipe = useCallback(
    (dx: number, dy: number) => {
      if (isMoving || availableMoves.length === 0) return;

      const swipeThreshold = 50;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < swipeThreshold) return;

      const angle = Math.atan2(-dy, dx);
      const worldAngle = angle - cameraRotation;

      let intendedDirection: 'north' | 'south' | 'east' | 'west';

      const normalizedAngle = ((worldAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

      if (normalizedAngle >= Math.PI * 0.25 && normalizedAngle < Math.PI * 0.75) {
        intendedDirection = 'north';
      } else if (normalizedAngle >= Math.PI * 0.75 && normalizedAngle < Math.PI * 1.25) {
        intendedDirection = 'west';
      } else if (normalizedAngle >= Math.PI * 1.25 && normalizedAngle < Math.PI * 1.75) {
        intendedDirection = 'south';
      } else {
        intendedDirection = 'east';
      }

      const move = availableMoves.find((m) => m.direction === intendedDirection);

      if (move) {
        startMoveTo(move.nodeId, 1.0);
      } else {
        const sortedMoves = [...availableMoves].sort((a, b) => {
          const getAngle = (dir: string) => {
            switch (dir) {
              case 'north':
                return Math.PI / 2;
              case 'south':
                return -Math.PI / 2;
              case 'east':
                return 0;
              case 'west':
                return Math.PI;
              default:
                return 0;
            }
          };
          const angleA = Math.abs(normalizedAngle - getAngle(a.direction));
          const angleB = Math.abs(normalizedAngle - getAngle(b.direction));
          return angleA - angleB;
        });

        if (sortedMoves.length > 0) {
          startMoveTo(sortedMoves[0].nodeId, 1.0);
        }
      }
    },
    [availableMoves, isMoving, startMoveTo, cameraRotation],
  );

  const detectCircleGesture = useCallback((history: TouchPoint[]): number | null => {
    if (history.length < 15) return null;

    const recent = history.slice(-30);

    let centerX = 0,
      centerY = 0;
    for (const p of recent) {
      centerX += p.x;
      centerY += p.y;
    }
    centerX /= recent.length;
    centerY /= recent.length;

    let totalAngle = 0;
    for (let i = 1; i < recent.length; i++) {
      const prev = recent[i - 1];
      const curr = recent[i];

      const angle1 = Math.atan2(prev.y - centerY, prev.x - centerX);
      const angle2 = Math.atan2(curr.y - centerY, curr.x - centerX);

      let dAngle = angle2 - angle1;
      if (dAngle > Math.PI) dAngle -= 2 * Math.PI;
      if (dAngle < -Math.PI) dAngle += 2 * Math.PI;

      totalAngle += dAngle;
    }

    if (Math.abs(totalAngle) > Math.PI * 1.2) {
      return totalAngle > 0 ? 1 : -1;
    }

    return null;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      touchHistoryRef.current = [
        {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        },
      ];
      isGestureRef.current = false;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 1 && touchStartRef.current) {
        const touch = e.touches[0];

        touchHistoryRef.current.push({
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        });

        if (touchHistoryRef.current.length > 50) {
          touchHistoryRef.current = touchHistoryRef.current.slice(-40);
        }

        const circleDirection = detectCircleGesture(touchHistoryRef.current);
        if (circleDirection !== null) {
          isGestureRef.current = true;
          const newRotation = cameraRotation + circleDirection * 0.1;
          setCameraRotation(newRotation);

          touchHistoryRef.current = touchHistoryRef.current.slice(-5);
        }
      }
    },
    [detectCircleGesture, cameraRotation, setCameraRotation],
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (touchStartRef.current && !isGestureRef.current) {
        const changedTouch = e.changedTouches[0];
        const dx = changedTouch.clientX - touchStartRef.current.x;
        const dy = changedTouch.clientY - touchStartRef.current.y;

        handleSwipe(dx, dy);
      }

      touchStartRef.current = null;
      touchHistoryRef.current = [];
      isGestureRef.current = false;
    },
    [handleSwipe],
  );

  const handleMouseDown = useCallback((e: MouseEvent) => {
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
    touchHistoryRef.current = [
      {
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
      },
    ];
    isGestureRef.current = false;
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (touchStartRef.current) {
        touchHistoryRef.current.push({
          x: e.clientX,
          y: e.clientY,
          time: Date.now(),
        });

        if (touchHistoryRef.current.length > 50) {
          touchHistoryRef.current = touchHistoryRef.current.slice(-40);
        }

        const circleDirection = detectCircleGesture(touchHistoryRef.current);
        if (circleDirection !== null) {
          isGestureRef.current = true;
          const newRotation = cameraRotation + circleDirection * 0.1;
          setCameraRotation(newRotation);

          touchHistoryRef.current = touchHistoryRef.current.slice(-5);
        }
      }
    },
    [detectCircleGesture, cameraRotation, setCameraRotation],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (touchStartRef.current && !isGestureRef.current) {
        const dx = e.clientX - touchStartRef.current.x;
        const dy = e.clientY - touchStartRef.current.y;

        handleSwipe(dx, dy);
      }

      touchStartRef.current = null;
      touchHistoryRef.current = [];
      isGestureRef.current = false;
    },
    [handleSwipe],
  );

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  ]);

  return null;
}
