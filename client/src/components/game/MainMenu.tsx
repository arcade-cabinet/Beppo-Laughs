import { motion } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { SettingsModal } from '@/components/game/SettingsModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/game/store';

interface MainMenuProps {
  onStart: (seed: string, isNewGame: boolean) => void;
}

// Seed word list for random generation
export const SEED_WORDS = [
  'bigtop',
  'ringmaster',
  'menagerie',
  'sideshow',
  'sawdust',
  'calliope',
  'barker',
  'midway',
  'lantern',
  'velvet',
  'cage',
  'caravan',
  'train',
  'banner',
  'spectacle',
  'tumbler',
  'fortune',
  'carnival',
  'parade',
  'gallows',
  'mask',
  'bell',
];

// Pattern to validate three-word seeds
const SEED_PATTERN = /^\s*\w+\s+\w+\s+\w+\s*$/;

export function MainMenu({ onStart }: MainMenuProps) {
  const [seedInput, setSeedInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [seedLocked, setSeedLocked] = useState(false);

  // Zustand store access
  const storedSeed = useGameStore((state) => state.seed);
  const isGameOver = useGameStore((state) => state.isGameOver);
  const hasSavedGame = !!storedSeed && !isGameOver;

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
    setSeedLocked(false);
    setErrorMessage('');
  }, []);

  useEffect(() => {
    generateRandomSeed();
  }, [generateRandomSeed]);

  useEffect(() => {
    if (seedLocked) return;
    const interval = setInterval(() => {
      generateRandomSeed();
    }, 30000);
    return () => clearInterval(interval);
  }, [generateRandomSeed, seedLocked]);

  const handleSeedChange = (value: string) => {
    setSeedInput(value);
    setSeedLocked(value.trim().length > 0);
    if (errorMessage && isValidSeed(value)) {
      setErrorMessage('');
    }
  };

  const handleStartNewGame = () => {
    if (!isValidSeed(seedInput)) {
      setErrorMessage('Enter a three-word seed (e.g., "shadow maze whisper").');
      return;
    }

    const seed = normalizedSeed(seedInput);
    onStart(seed, true);
  };

  const handleContinueGame = () => {
    if (hasSavedGame) {
      onStart(storedSeed, false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-12 text-center"
      >
        <div className="space-y-2">
          <h1 className="font-horror text-6xl md:text-8xl text-secondary animate-pulse drop-shadow-[0_0_15px_rgba(139,0,0,0.8)]">
            BEPPO LAUGHS
          </h1>
          <p className="text-muted-foreground font-ui tracking-widest uppercase text-sm">
            Trapped in the Big-Top Nightmare
          </p>
        </div>

        <div className="space-y-6">
          {/* Continue Game Button */}
          <Button
            size="lg"
            variant={hasSavedGame ? 'secondary' : 'outline'}
            onClick={handleContinueGame}
            disabled={!hasSavedGame}
            className={`w-full font-creepy tracking-wider text-2xl h-16 ${
              hasSavedGame
                ? 'bg-primary hover:bg-primary/80 text-primary-foreground'
                : 'border-white/10 text-white/20'
            }`}
            data-testid="button-continue-game"
          >
            CONTINUE GAME
          </Button>

          {/* New Game Section */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/70">
              Start New Nightmare
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter three seed words..."
                  value={seedInput}
                  onChange={(e) => handleSeedChange(e.target.value)}
                  className="bg-card/50 border-primary/30 font-mono text-lg h-12"
                  data-testid="input-seed"
                  aria-label="Game seed input"
                  aria-invalid={!!errorMessage}
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={generateRandomSeed}
                className="h-12 w-12 border-primary/30 hover:bg-primary/20 hover:text-primary-foreground"
                title="Randomize Seed"
                aria-label="Randomize seed"
              >
                <Shuffle className="h-5 w-5" />
              </Button>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-400" role="alert">
                {errorMessage}
              </p>
            )}

            <Button
              size="lg"
              onClick={handleStartNewGame}
              className="w-full bg-secondary hover:bg-secondary/80 text-white font-creepy tracking-wider text-xl h-14"
              data-testid="button-start-game"
            >
              NEW GAME
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 flex justify-between items-end">
          <div className="text-left text-xs text-muted-foreground/50 font-mono space-y-1">
            <p>WARNING: GYROSCOPE & HAPTICS RECOMMENDED</p>
            <p>HEADPHONES REQUIRED</p>
          </div>
          <SettingsModal />
        </div>
      </motion.div>
    </div>
  );
}
