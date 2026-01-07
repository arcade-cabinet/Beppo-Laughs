import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

interface ErrorFallbackProps {
  error: Error | unknown;
  resetError: () => void;
  title?: string;
  message?: string;
}

/**
 * Fallback UI component displayed when an error boundary catches an error.
 * Shows user-friendly error message with expandable technical details.
 *
 * @example
 * <ErrorFallback
 *   error={error}
 *   resetError={handleReset}
 *   title="Game Error"
 *   message="The game encountered an error and needs to restart."
 * />
 */
export function ErrorFallback({
  error,
  resetError,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. You can try restarting.',
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Extract error message and stack
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  return (
    <div
      className="flex items-center justify-center w-full h-screen bg-black p-4"
      role="alert"
      aria-live="assertive"
    >
      <Card className="w-full max-w-2xl border-red-500/50 bg-black/90 text-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
            <CardTitle className="text-2xl font-creepy text-red-500">{title}</CardTitle>
          </div>
          <CardDescription className="text-white/80 font-mono mt-2">{message}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error message */}
          <div className="bg-red-950/30 border border-red-500/30 rounded p-3">
            <p className="text-red-400 font-mono text-sm break-words">{errorMessage}</p>
          </div>

          {/* Expandable technical details */}
          {errorStack && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-white/60 hover:text-white font-mono text-xs underline"
              >
                {showDetails ? 'Hide' : 'Show'} technical details
              </button>

              {showDetails && (
                <div className="bg-black/50 border border-white/10 rounded p-3 overflow-auto max-h-64">
                  <pre className="text-white/70 font-mono text-xs whitespace-pre-wrap break-words">
                    {errorStack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={resetError}
            variant="destructive"
            className="w-full font-creepy text-lg"
            data-testid="button-restart-game"
          >
            RESTART GAME
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
