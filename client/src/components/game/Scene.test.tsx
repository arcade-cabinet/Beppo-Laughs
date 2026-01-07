import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Scene from './Scene';

// Properly mock R3F with Canvas and hooks
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="mock-canvas">{children}</div>,
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({ camera: {}, scene: {}, gl: {} })),
  extend: vi.fn(),
}));

// Mock drei with common helpers
vi.mock('@react-three/drei', () => ({
  useTexture: vi.fn(() => ({})),
  Sky: () => null,
  Environment: () => null,
  Html: ({ children }: any) => <div>{children}</div>,
}));

// Mock Three.js classes and utilities
vi.mock('three', () => ({
  Mesh: class {},
  Group: class {},
  MeshStandardMaterial: class {},
  Fog: class {},
  Color: class {},
  Vector3: class {},
  MathUtils: { lerp: (a: number, b: number, t: number) => a + (b - a) * t },
}));

describe('Scene component', () => {
  it('renders without crashing', () => {
    render(<Scene />);
    expect(screen.getByTestId('mock-canvas')).toBeTruthy();
  });

  it('handles missing optional props gracefully', () => {
    expect(() => render(<Scene />)).not.toThrow();
  });
});
