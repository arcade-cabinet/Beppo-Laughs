import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MainMenuProps {
  onStart: (seed: string) => void;
}

const SEED_WORDS = ['dark', 'blood', 'shadow', 'maze', 'fear', 'run', 'hide', 'scream', 'whisper', 'death', 'green', 'hedge'];
const SEED_PATTERN = /^[a-zA-Z]+(?:\s+[a-zA-Z]+){2}$/;

export function MainMenu({ onStart }: MainMenuProps) {
  const [seedInput, setSeedInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const normalizedSeed = useCallback(
    (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase(),
    []
  );

  const isValidSeed = useCallback(
    (value: string) => SEED_PATTERN.test(normalizedSeed(value)),
    [normalizedSeed]
  );

  const generateRandomSeed = useCallback(() => {
    const r = () => SEED_WORDS[Math.floor(Math.random() * SEED_WORDS.length)];
    const generated = `${r()} ${r()} ${r()}`;
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
            />
            {errorMessage && (
              <p className="mt-2 text-sm text-red-400" data-testid="text-seed-error">
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
            >
              Randomize
            </Button>

            <Button
              size="lg"
              onClick={handleStart}
              className="bg-secondary hover:bg-secondary/80 text-white font-creepy tracking-wider text-xl px-8"
              disabled={!isValidSeed(seedInput)}
              data-testid="button-start-game"
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
