import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MainMenuProps {
  onStart: (seed: string) => void;
}

// Seed word list for random generation
export const SEED_WORDS = [
  'dark',
  'blood',
  'shadow',
  'maze',
  'fear',
  'run',
  'hide',
  'scream',
  'whisper',
  'death',
  'green',
  'hedge',
];

// Pattern to validate three-word seeds
const SEED_PATTERN = /^\s*\w+\s+\w+\s+\w+\s*$/;

export function MainMenu({ onStart }: MainMenuProps) {
  const [seedInput, setSeedInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const normalizedSeed = useCallback(
    (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase(),
    [],
  );

  const isValidSeed = useCallback(
    (value: string) => SEED_PATTERN.test(normalizedSeed(value)),
    [normalizedSeed],
  );

  const generateRandomSeed = useCallback(() => {
    // Fisher-Yates shuffle for uniform randomization
    const shuffled = [...SEED_WORDS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const generated = `${shuffled[0]} ${shuffled[1]} ${shuffled[2]}`;
    setSeedInput(generated);
    setErrorMessage('');
  }, []);

  useEffect(() => {
    generateRandomSeed();
  }, [generateRandomSeed]);

  const handleSeedChange = (value: string) => {
    setSeedInput(value);
    if (errorMessage && isValidSeed(value)) {
      setErrorMessage('');
    }
  };

  const handleStart = () => {
    if (!isValidSeed(seedInput)) {
      setErrorMessage('Enter a three-word seed (e.g., "shadow maze whisper").');
      return;
    }

    const seed = normalizedSeed(seedInput);
    onStart(seed);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <h1 className="font-horror text-6xl md:text-8xl text-secondary animate-pulse drop-shadow-[0_0_15px_rgba(139,0,0,0.8)]">
          BEPPO LAUGHS
        </h1>

        <p className="text-muted-foreground font-ui tracking-widest uppercase text-sm">
          Procedural Survival Horror
        </p>

        <div className="space-y-4 pt-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter three seed words..."
              value={seedInput}
              onChange={(e) => handleSeedChange(e.target.value)}
              className="bg-card/50 border-primary/30 text-center font-mono text-lg h-12"
              data-testid="input-seed"
              aria-label="Game seed input"
              aria-invalid={!!errorMessage}
              aria-describedby={errorMessage ? 'seed-error' : undefined}
            />
            {errorMessage && (
              <p
                id="seed-error"
                className="mt-2 text-sm text-red-400"
                data-testid="text-seed-error"
                role="alert"
              >
                {errorMessage}
              </p>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={generateRandomSeed}
              className="border-primary/50 hover:bg-primary/20 hover:text-primary-foreground font-ui"
              data-testid="button-random-seed"
              aria-label="Generate random seed"
            >
              Randomize
            </Button>

            <Button
              size="lg"
              onClick={handleStart}
              className="bg-secondary hover:bg-secondary/80 text-white font-creepy tracking-wider text-xl px-8"
              data-testid="button-start-game"
              aria-label="Start game with current seed"
            >
              ENTER MAZE
            </Button>
          </div>
        </div>

        <div className="pt-12 text-xs text-muted-foreground/50 font-mono">
          <p>WARNING: GYROSCOPE & HAPTICS RECOMMENDED</p>
          <p>HEADPHONES REQUIRED</p>
        </div>
      </motion.div>
    </div>
  );
}
