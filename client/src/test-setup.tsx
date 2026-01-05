import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
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
    div: ({ children, initial: _, animate: _a, exit: _e, variants: _v, transition: _t, ...rest }: MotionProps) => (
      <div {...rest}>{children}</div>
    ),
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
