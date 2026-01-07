import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Maze from './Maze';

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="mock-canvas">{children}</div>,
  useFrame: () => {},
}));
vi.mock('@react-three/drei', () => ({}));
vi.mock('three', () => ({}));

describe('Maze component', () => {
  it('renders with minimal props', () => {
    render(<Maze />);
    expect(screen.getByTestId('mock-canvas')).toBeTruthy();
  });

  it('is resilient to invalid/empty maze data', () => {
    expect(() => render(<Maze mazeData={null as any} />)).not.toThrow();
    expect(() => render(<Maze mazeData={undefined as any} />)).not.toThrow();
    expect(() => render(<Maze mazeData={{} as any} />)).not.toThrow();
  });
});