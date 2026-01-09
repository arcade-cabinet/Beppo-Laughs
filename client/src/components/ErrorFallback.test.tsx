import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorFallback } from './ErrorFallback';

describe('ErrorFallback', () => {
  const mockResetError = vi.fn();
  const mockError = new Error('Test error message');

  describe('Default Rendering', () => {
    it('renders with default title and message', () => {
      render(<ErrorFallback error={mockError} resetError={mockResetError} />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText('An unexpected error occurred. You can try restarting.'),
      ).toBeInTheDocument();
    });

    it('displays error message', () => {
      render(<ErrorFallback error={mockError} resetError={mockResetError} />);

      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('shows restart game button', () => {
      render(<ErrorFallback error={mockError} resetError={mockResetError} />);

      const button = screen.getByTestId('button-restart-game');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('RESTART GAME');
    });

    it('has alert role for accessibility', () => {
      render(<ErrorFallback error={mockError} resetError={mockResetError} />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('has aria-live attribute for screen readers', () => {
      render(<ErrorFallback error={mockError} resetError={mockResetError} />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('Custom Props', () => {
    it('renders custom title when provided', () => {
      render(
        <ErrorFallback error={mockError} resetError={mockResetError} title="Custom Error Title" />,
      );

      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    });

    it('renders custom message when provided', () => {
      render(
        <ErrorFallback
          error={mockError}
          resetError={mockResetError}
          message="Custom error description"
        />,
      );

      expect(screen.getByText('Custom error description')).toBeInTheDocument();
    });

    it('renders both custom title and message', () => {
      render(
        <ErrorFallback
          error={mockError}
          resetError={mockResetError}
          title="Game Crashed"
          message="The game has encountered a fatal error."
        />,
      );

      expect(screen.getByText('Game Crashed')).toBeInTheDocument();
      expect(screen.getByText('The game has encountered a fatal error.')).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('displays Error object message', () => {
      const error = new Error('Specific error details');
      render(<ErrorFallback error={error} resetError={mockResetError} />);

      expect(screen.getByText('Specific error details')).toBeInTheDocument();
    });

    it('displays string error', () => {
      render(<ErrorFallback error="String error message" resetError={mockResetError} />);

      expect(screen.getByText('String error message')).toBeInTheDocument();
    });

    it('displays unknown error type as string', () => {
      render(<ErrorFallback error={{ custom: 'object' }} resetError={mockResetError} />);

      expect(screen.getByText('[object Object]')).toBeInTheDocument();
    });

    it('displays number error', () => {
      render(<ErrorFallback error={404} resetError={mockResetError} />);

      expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('handles null error', () => {
      render(<ErrorFallback error={null} resetError={mockResetError} />);

      expect(screen.getByText('null')).toBeInTheDocument();
    });

    it('handles undefined error', () => {
      render(<ErrorFallback error={undefined} resetError={mockResetError} />);

      expect(screen.getByText('undefined')).toBeInTheDocument();
    });
  });

  describe('Technical Details', () => {
    it('shows "Show technical details" button when error has stack', () => {
      const errorWithStack = new Error('Error with stack');
      render(<ErrorFallback error={errorWithStack} resetError={mockResetError} />);

      expect(screen.getByText('Show technical details')).toBeInTheDocument();
    });

    it('does not show technical details button for non-Error objects', () => {
      render(<ErrorFallback error="String error" resetError={mockResetError} />);

      expect(screen.queryByText('Show technical details')).not.toBeInTheDocument();
    });

    it('toggles technical details when button is clicked', () => {
      const errorWithStack = new Error('Error with stack');
      render(<ErrorFallback error={errorWithStack} resetError={mockResetError} />);

      // Initially hidden
      expect(screen.queryByText(/at /)).not.toBeInTheDocument();

      // Click to show
      fireEvent.click(screen.getByText('Show technical details'));

      // Now visible (stack trace contains "at " for function calls)
      const stackElement = screen.getByText((content, element) => {
        return element?.tagName === 'PRE' && content.length > 0;
      });
      expect(stackElement).toBeInTheDocument();

      // Click to hide
      fireEvent.click(screen.getByText('Hide technical details'));

      // Hidden again
      expect(screen.queryByText(/at (?!.*Show)/)).not.toBeInTheDocument();
    });

    it('displays full error stack in technical details', () => {
      const errorWithStack = new Error('Detailed error');
      render(<ErrorFallback error={errorWithStack} resetError={mockResetError} />);

      fireEvent.click(screen.getByText('Show technical details'));

      // Check that stack is displayed
      const stackElement = screen.getByText((content, element) => {
        return element?.tagName === 'PRE' && content.includes('Error: Detailed error');
      });
      expect(stackElement).toBeInTheDocument();
    });

    it('button text changes when toggling details', () => {
      const errorWithStack = new Error('Error');
      render(<ErrorFallback error={errorWithStack} resetError={mockResetError} />);

      expect(screen.getByText('Show technical details')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Show technical details'));
      expect(screen.getByText('Hide technical details')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Hide technical details'));
      expect(screen.getByText('Show technical details')).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('calls resetError when restart button is clicked', () => {
      const resetFn = vi.fn();
      render(<ErrorFallback error={mockError} resetError={resetFn} />);

      const button = screen.getByTestId('button-restart-game');
      fireEvent.click(button);

      expect(resetFn).toHaveBeenCalledTimes(1);
    });

    it('does not call resetError on initial render', () => {
      const resetFn = vi.fn();
      render(<ErrorFallback error={mockError} resetError={resetFn} />);

      expect(resetFn).not.toHaveBeenCalled();
    });

    it('calls resetError only once per click', () => {
      const resetFn = vi.fn();
      render(<ErrorFallback error={mockError} resetError={resetFn} />);

      const button = screen.getByTestId('button-restart-game');
      fireEvent.click(button);

      expect(resetFn).toHaveBeenCalledTimes(1);
    });

    it('calls resetError on multiple clicks', () => {
      const resetFn = vi.fn();
      render(<ErrorFallback error={mockError} resetError={resetFn} />);

      const button = screen.getByTestId('button-restart-game');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(resetFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('Styling and Layout', () => {
    it('renders AlertCircle icon', () => {
      const { container } = render(<ErrorFallback error={mockError} resetError={mockResetError} />);

      // Check for lucide-react icon by class or aria-hidden
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('applies creepy font to title', () => {
      render(<ErrorFallback error={mockError} resetError={mockResetError} title="Custom Title" />);

      const title = screen.getByText('Custom Title');
      expect(title).toHaveClass('font-creepy');
    });

    it('applies mono font to message', () => {
      render(
        <ErrorFallback error={mockError} resetError={mockResetError} message="Custom message" />,
      );

      const message = screen.getByText('Custom message');
      expect(message).toHaveClass('font-mono');
    });

    it('uses destructive variant for restart button', () => {
      render(<ErrorFallback error={mockError} resetError={mockResetError} />);

      // The Button component should have destructive styling
      const button = screen.getByTestId('button-restart-game');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long error messages', () => {
      const longMessage = 'A'.repeat(1000);
      const error = new Error(longMessage);
      render(<ErrorFallback error={error} resetError={mockResetError} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('handles error messages with special characters', () => {
      const error = new Error('Error: <script>alert("XSS")</script>');
      render(<ErrorFallback error={error} resetError={mockResetError} />);

      // Should render as text, not execute script
      expect(screen.getByText(/Error: <script>alert/)).toBeInTheDocument();
    });

    it('handles error with multiline message', () => {
      const error = new Error('Line 1\nLine 2\nLine 3');
      render(<ErrorFallback error={error} resetError={mockResetError} />);

      expect(screen.getByText(/Line 1.*Line 2.*Line 3/s)).toBeInTheDocument();
    });

    it('handles empty string error', () => {
      render(<ErrorFallback error="" resetError={mockResetError} />);

      // Should still render the card structure
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByTestId('button-restart-game')).toBeInTheDocument();
    });
  });
});
