import React, { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (props: { error: Error; resetError: () => void }) => ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that catches React rendering errors and displays a fallback UI.
 * Implements React error boundary pattern with getDerivedStateFromError and componentDidCatch.
 *
 * @example
 * <ErrorBoundary
 *   fallback={({ error, resetError }) => <ErrorFallback error={error} resetError={resetError} />}
 *   onReset={() => resetGameState()}
 * >
 *   <GameComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details to console for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
  }

  resetError = (): void => {
    // Clear error state
    this.setState({ hasError: false, error: null });
    
    // Call optional onReset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Render fallback UI with error and reset handler
      return this.props.fallback({
        error: this.state.error,
        resetError: this.resetError,
      });
    }

    // Render children normally when no error
    return this.props.children;
  }
}
