import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import Scene from './Scene';

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="mock-canvas">{children}</div>,
  useFrame: () => {},
}));
vi.mock('@react-three/drei', () => ({}));
vi.mock('three', () => ({}));

describe('Scene component', () => {
  it('renders without crashing', () => {
    render(<Scene />);
    expect(screen.getByTestId('mock-canvas')).toBeTruthy();
  });

  it('handles missing optional props gracefully', () => {
    expect(() => render(<Scene />)).not.toThrow();
  });
});
