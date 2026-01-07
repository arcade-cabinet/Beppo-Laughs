import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

// Mock child component that can throw errors on demand
function ThrowError({ shouldThrow, message }: { shouldThrow: boolean; message?: string }) {
  if (shouldThrow) {
    throw new Error(message || 'Test error');
  }
  return <div data-testid="child-component">Child content</div>;
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let mockOnReset: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock console.error to prevent error logs cluttering test output
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOnReset = vi.fn();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('Normal Rendering', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary fallback={({ error }) => <div>Error: {error.message}</div>}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('child-component')).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('does not render fallback when children render successfully', () => {
      render(
        <ErrorBoundary fallback={() => <div data-testid="fallback">Error fallback</div>}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
    });
  });

  describe('Error Catching', () => {
    it('catches errors thrown by child components', () => {
      render(
        <ErrorBoundary
          fallback={({ error }) => <div data-testid="fallback">Error: {error.message}</div>}
        >
          <ThrowError shouldThrow={true} message="Component crashed" />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('fallback')).toBeInTheDocument();
      expect(screen.getByText('Error: Component crashed')).toBeInTheDocument();
    });

    it('displays fallback UI when error occurs', () => {
      render(
        <ErrorBoundary fallback={() => <div data-testid="fallback">Something went wrong</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('fallback')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('does not render children when error is caught', () => {
      render(
        <ErrorBoundary fallback={() => <div data-testid="fallback">Error</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
    });

    it('passes error object to fallback component', () => {
      const errorMessage = 'Specific error message';
      
      render(
        <ErrorBoundary
          fallback={({ error }) => (
            <div>
              <span data-testid="error-type">{error.constructor.name}</span>
              <span data-testid="error-message">{error.message}</span>
            </div>
          )}
        >
          <ThrowError shouldThrow={true} message={errorMessage} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('error-type')).toHaveTextContent('Error');
      expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage);
    });
  });

  describe('Error Logging', () => {
    it('logs error to console when caught', () => {
      render(
        <ErrorBoundary fallback={() => <div>Error</div>}>
          <ThrowError shouldThrow={true} message="Log this error" />
        </ErrorBoundary>,
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
      // Check that the error was logged
      const errorCalls = consoleErrorSpy.mock.calls.filter((call) =>
        call.some((arg) => typeof arg === 'string' && arg.includes('ErrorBoundary caught an error')),
      );
      expect(errorCalls.length).toBeGreaterThan(0);
    });

    it('logs error stack trace', () => {
      render(
        <ErrorBoundary fallback={() => <div>Error</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      const stackCalls = consoleErrorSpy.mock.calls.filter((call) =>
        call.some((arg) => typeof arg === 'string' && arg.includes('Error stack')),
      );
      expect(stackCalls.length).toBeGreaterThan(0);
    });

    it('logs component stack', () => {
      render(
        <ErrorBoundary fallback={() => <div>Error</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      const stackCalls = consoleErrorSpy.mock.calls.filter((call) =>
        call.some((arg) => typeof arg === 'string' && arg.includes('Component stack')),
      );
      expect(stackCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Reset Functionality', () => {
    it('provides resetError function to fallback', () => {
      render(
        <ErrorBoundary
          fallback={({ resetError }) => (
            <button type="button" onClick={resetError} data-testid="reset-button">
              Reset
            </button>
          )}
        >
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('reset-button')).toBeInTheDocument();
    });

    it('calls onReset callback when resetError is invoked', () => {
      const { rerender } = render(
        <ErrorBoundary
          fallback={({ resetError }) => (
            <button type="button" onClick={resetError} data-testid="reset-button">
              Reset
            </button>
          )}
          onReset={mockOnReset}
        >
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      // Click reset button
      screen.getByTestId('reset-button').click();

      expect(mockOnReset).toHaveBeenCalledTimes(1);
      
      // After reset, re-render with no error
      rerender(
        <ErrorBoundary
          fallback={({ resetError }) => (
            <button type="button" onClick={resetError} data-testid="reset-button">
              Reset
            </button>
          )}
          onReset={mockOnReset}
        >
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>,
      );
    });

    it('clears error state when resetError is called', () => {
      const { rerender } = render(
        <ErrorBoundary
          fallback={({ resetError }) => (
            <button type="button" onClick={resetError} data-testid="reset-button">
              Reset
            </button>
          )}
        >
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('reset-button')).toBeInTheDocument();

      // Click reset
      screen.getByTestId('reset-button').click();

      // Re-render with non-throwing child
      rerender(
        <ErrorBoundary fallback={() => <div>Error</div>}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>,
      );

      // Should now show children instead of fallback
      expect(screen.getByTestId('child-component')).toBeInTheDocument();
      expect(screen.queryByTestId('reset-button')).not.toBeInTheDocument();
    });

    it('does not throw error if onReset is not provided', () => {
      const { rerender } = render(
        <ErrorBoundary
          fallback={({ resetError }) => (
            <button type="button" onClick={resetError} data-testid="reset-button">
              Reset
            </button>
          )}
        >
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      // Should not throw when clicking reset without onReset callback
      expect(() => screen.getByTestId('reset-button').click()).not.toThrow();

      // Re-render with non-throwing child
      rerender(
        <ErrorBoundary fallback={() => <div>Error</div>}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>,
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple errors in sequence', () => {
      const { rerender } = render(
        <ErrorBoundary fallback={({ error }) => <div data-testid="fallback">{error.message}</div>}>
          <ThrowError shouldThrow={true} message="First error" />
        </ErrorBoundary>,
      );

      expect(screen.getByText('First error')).toBeInTheDocument();

      // Trigger second error
      rerender(
        <ErrorBoundary fallback={({ error }) => <div data-testid="fallback">{error.message}</div>}>
          <ThrowError shouldThrow={true} message="Second error" />
        </ErrorBoundary>,
      );

      // Should still show error (may be first or second depending on implementation)
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });

    it('handles nested error boundaries correctly', () => {
      render(
        <ErrorBoundary fallback={() => <div data-testid="outer-fallback">Outer error</div>}>
          <div>
            <ErrorBoundary fallback={() => <div data-testid="inner-fallback">Inner error</div>}>
              <ThrowError shouldThrow={true} />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>,
      );

      // Inner boundary should catch the error
      expect(screen.getByTestId('inner-fallback')).toBeInTheDocument();
      expect(screen.queryByTestId('outer-fallback')).not.toBeInTheDocument();
    });
  });
});
