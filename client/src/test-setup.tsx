import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import type React from 'react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Simplified type for motion component props
type MotionProps = {
  children?: React.ReactNode;
  [key: string]: unknown;
};

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      initial: _,
      animate: _a,
      exit: _e,
      variants: _v,
      transition: _t,
      ...rest
    }: MotionProps) => <div {...rest}>{children}</div>,
    button: ({
      children,
      initial: _,
      animate: _a,
      exit: _e,
      variants: _v,
      transition: _t,
      whileHover: _wh,
      whileTap: _wt,
      ...rest
    }: MotionProps) => <button {...rest}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock video and audio assets
vi.mock('@assets/generated_videos/beppo_clown_emerging_laughing_game_over.mp4', () => ({
  default: 'mock-video-url',
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Three.js/Canvas elements if needed,
// though typically R3F tests use @react-three/test-renderer or
// we just ignore the console warnings about <mesh> etc when using @testing-library/react
// on R3F components because they render custom elements.
// However, we can suppress the specific console errors that are expected.
const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = args[0];
  if (
    typeof msg === 'string' &&
    (msg.includes('is using incorrect casing') ||
      msg.includes('The tag <') ||
      msg.includes('unrecognized in this browser'))
  ) {
    return;
  }
  originalConsoleError(...args);
};
