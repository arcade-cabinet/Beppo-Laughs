import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Maze from './Maze';

// Properly mock R3F with Canvas and extend support
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="mock-canvas">{children}</div>,
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({ camera: {}, scene: {}, gl: {} })),
  extend: vi.fn(),
}));

// Mock drei helpers
vi.mock('@react-three/drei', () => ({
  useTexture: vi.fn(() => ({})),
  Html: ({ children }: any) => <div>{children}</div>,
}));

// Mock Three.js with basic types
vi.mock('three', () => ({
  Mesh: class {},
  Group: class {},
  MeshStandardMaterial: class {},
  TextureLoader: class {},
  Color: class {},
  Vector3: class {},
  MathUtils: { lerp: (a: number, b: number, t: number) => a + (b - a) * t },
}));

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
