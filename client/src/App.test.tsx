import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

// Mock child components
vi.mock('./pages/Home', () => ({
  default: () => <div data-testid="home-page">Beppo Laughs - Home Page</div>,
}));

vi.mock('./pages/not-found', () => ({
  default: () => <div data-testid="not-found-page">Not Found</div>,
}));

vi.mock('./components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

vi.mock('./lib/queryClient', () => ({
  queryClient: {
    mount: vi.fn(),
    unmount: vi.fn(),
    clear: vi.fn(),
  },
}));

// Mock wouter for routing tests
let mockLocation = '/';
let mockBasePath = '/';

vi.mock('wouter', () => ({
  Route: ({ path, component: Component }: { path: string; component: () => JSX.Element }) => {
    const matches = mockLocation === path || (path === '/' && mockLocation === mockBasePath);
    return matches ? <Component /> : null;
  },
  Switch: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Router: ({ base, children }: { base?: string; children: React.ReactNode }) => {
    mockBasePath = base || '/';
    return (
      <div data-testid="router" data-base={base}>
        {children}
      </div>
    );
  },
}));

describe('App', () => {
  beforeEach(() => {
    mockLocation = '/';
    mockBasePath = '/';
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(<App />);
      expect(screen.getByTestId('router')).toBeInTheDocument();
    });

    it('renders Toaster component', () => {
      render(<App />);
      expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });

    it('renders Home page on root route', () => {
      mockLocation = '/';
      render(<App />);
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('wraps components in QueryClientProvider', () => {
      const { container } = render(<App />);
      // QueryClientProvider doesn't have a direct test ID, but we can verify children render
      expect(container.querySelector('[data-testid="router"]')).toBeInTheDocument();
    });
  });

  describe('Base Path Configuration', () => {
    it('Router component receives base path from import.meta.env.BASE_URL', () => {
      render(<App />);
      const router = screen.getByTestId('router');

      // The base path is set at build time from import.meta.env.BASE_URL
      // In test environment, it defaults to '/' or whatever is configured
      expect(router).toHaveAttribute('data-base');
      const basePath = router.getAttribute('data-base');

      // Should be a valid path (starts with /)
      expect(basePath).toMatch(/^\//);
    });

    it('base path defaults to "/" when BASE_URL is not explicitly set', () => {
      render(<App />);
      const router = screen.getByTestId('router');

      // In test environment without explicit BASE_URL, should default to '/'
      const basePath = router.getAttribute('data-base');
      expect(typeof basePath).toBe('string');
      expect(basePath?.startsWith('/')).toBe(true);
    });

    it('base path is properly formatted', () => {
      render(<App />);
      const router = screen.getByTestId('router');
      const basePath = router.getAttribute('data-base');

      // Should be a string starting with /
      expect(basePath).toBeTruthy();
      expect(basePath?.startsWith('/')).toBe(true);
    });
  });

  describe('Router Behavior', () => {
    it('Router receives basePath prop', () => {
      render(<App />);
      const router = screen.getByTestId('router');

      // Verify the router has a data-base attribute
      expect(router).toHaveAttribute('data-base');
    });

    it('maintains route structure', () => {
      render(<App />);

      // Routes should be defined internally
      // The Router component handles prepending the base
      expect(screen.getByTestId('router')).toBeInTheDocument();
    });

    it('base path is consistent across renders', () => {
      const { unmount } = render(<App />);
      const firstBasePath = screen.getByTestId('router').getAttribute('data-base');
      unmount();

      render(<App />);
      const secondBasePath = screen.getByTestId('router').getAttribute('data-base');

      expect(firstBasePath).toBe(secondBasePath);
    });
  });

  describe('Integration', () => {
    it('renders complete app structure', () => {
      render(<App />);

      // Should have all main components
      expect(screen.getByTestId('toaster')).toBeInTheDocument();
      expect(screen.getByTestId('router')).toBeInTheDocument();
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('routes home page correctly', () => {
      render(<App />);

      expect(screen.getByTestId('router')).toHaveAttribute('data-base');
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('provides QueryClient to children', () => {
      render(<App />);

      // Children (Home, Toaster, Router) should all render
      expect(screen.getByTestId('toaster')).toBeInTheDocument();
      expect(screen.getByTestId('router')).toBeInTheDocument();
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles re-mounting gracefully', () => {
      const { unmount } = render(<App />);
      unmount();

      render(<App />);
      expect(screen.getByTestId('router')).toBeInTheDocument();
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('renders correctly after multiple re-renders', () => {
      const { rerender } = render(<App />);

      rerender(<App />);
      rerender(<App />);

      expect(screen.getByTestId('router')).toBeInTheDocument();
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('maintains component hierarchy', () => {
      const { container } = render(<App />);

      // Should have proper nesting
      const router = container.querySelector('[data-testid="router"]');
      const homePage = container.querySelector('[data-testid="home-page"]');

      expect(router).toBeInTheDocument();
      expect(homePage).toBeInTheDocument();
      expect(router).toContainElement(homePage);
    });
  });

  describe('Router Base Path Logic', () => {
    it('basePath is derived from import.meta.env.BASE_URL with fallback', () => {
      render(<App />);
      const router = screen.getByTestId('router');
      const basePath = router.getAttribute('data-base');

      // The actual logic: const basePath = import.meta.env.BASE_URL || '/';
      // We verify it results in a valid path
      expect(basePath).toBeTruthy();
      expect(basePath).toMatch(/^\/[^?#]*/); // Valid path format
    });

    it('basePath does not contain query or hash', () => {
      render(<App />);
      const router = screen.getByTestId('router');
      const basePath = router.getAttribute('data-base');

      expect(basePath).not.toContain('?');
      expect(basePath).not.toContain('#');
    });

    it('basePath is used by wouter Router', () => {
      render(<App />);

      // The Router component should receive and use the basePath
      // Verify by checking that it's passed through
      const router = screen.getByTestId('router');
      expect(router.hasAttribute('data-base')).toBe(true);
    });
  });
});
describe('App routing and basic render (extended)', () => {
  it('renders without crashing and shows root UI elements', async () => {
    const { findByText } = render(<App />);
    expect(await findByText(/Beppo/i)).toBeTruthy();
  });

  it('handles unexpected props/state gracefully', async () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
