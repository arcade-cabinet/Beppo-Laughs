import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MainMenuProps {
  onStart: (seed: string) => void;
}

interface MazeInfo {
  phrase: string;
  hash: string;
  title?: string;
  description?: string;
  performers: number;
  backdrops: number;
}

const DEFAULT_MAZES: MazeInfo[] = [
  {
    phrase: 'dark blood shadow',
    hash: 'default-1',
    title: 'The Crimson Corridor',
    description: 'A tattered path where the paint is still wet, and it isn\'t paint.',
    performers: 5,
    backdrops: 3
  },
  {
    phrase: 'circus clown laugh',
    hash: 'default-2',
    title: 'Beppo\'s Funhouse',
    description: 'He\'s waiting in the mirrors. Don\'t look back.',
    performers: 7,
    backdrops: 4
  }
];

export function MainMenu({ onStart }: MainMenuProps) {
  const [mazes, setMazes] = useState<MazeInfo[]>(DEFAULT_MAZES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [glitchText, setGlitchText] = useState('BEPPO LAUGHS');
  const [seed, setSeed] = useState('');
  const [showFlicker, setShowFlicker] = useState(false);
  const [barkerPhrase, setBarkerPhrase] = useState('');

  const barkerPhrases = [
    "STEP RIGHT UP TO YOUR OWN DEMISE!",
    "A NIGHTMARE FOR EVERY WALLET!",
    "THE EXIT IS A LIE, THE LAUGHTER IS REAL!",
    "PICK A PATH, LOSE A SOUL!",
    "BEPPO IS HUNGRY TODAY, FRIENDS!"
  ];

  // Fetch mazes and set barker phrases
  useEffect(() => {
    fetch('/assets/mazes/index.json')
      .then(res => res.json())
      .then(data => {
        if (data.mazes && data.mazes.length > 0) {
          setMazes(data.mazes);
        }
      })
      .catch(() => console.log('Using default mazes'));

    const barkerInterval = setInterval(() => {
      setBarkerPhrase(barkerPhrases[Math.floor(Math.random() * barkerPhrases.length)]);
    }, 5000);
    setBarkerPhrase(barkerPhrases[0]);
    return () => clearInterval(barkerInterval);
  }, []);

  // Auto-rotate mazes every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mazes.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [mazes.length]);

  const handleStart = () => {
    const selected = mazes[currentIndex];
    onStart(selected.phrase);
  };

  const nextMaze = () => setCurrentIndex((prev) => (prev + 1) % mazes.length);
  const prevMaze = () => setCurrentIndex((prev) => (prev - 1 + mazes.length) % mazes.length);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white p-4 overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 20% 50%, rgba(139, 0, 0, 0.3) 0%, transparent 50%)',
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 80% 50%, rgba(139, 0, 0, 0.2) 0%, transparent 50%)',
            animation: 'pulse 5s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* CRT scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.06,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.4) 2px,
            rgba(0, 0, 0, 0.4) 4px
          )`,
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 150px rgba(0, 0, 0, 0.9)',
        }}
      />

      {/* Screen flicker effect */}
      <AnimatePresence>
        {showFlicker && (
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white mix-blend-overlay pointer-events-none"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-md w-full space-y-8 text-center relative z-10"
      >
        {/* Title with glitch and layered shadows */}
        <div className="relative">
          {/* Glitch layers */}

          {/* Main title */}
          <h1
            className="font-horror text-6xl md:text-8xl text-red-600 relative animate-pulse"
            style={{
              textShadow: `
                0 0 10px rgba(139, 0, 0, 0.8),
                0 0 20px rgba(139, 0, 0, 0.6),
                0 0 40px rgba(139, 0, 0, 0.4),
                0 0 80px rgba(139, 0, 0, 0.2)
              `,
            }}
          >
            {glitchText}
          </h1>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-amber-200/60 font-creepy tracking-[0.3em] uppercase text-sm"
        >
          Procedural Survival Horror
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="relative pt-8 px-4"
        >
          {/* Barker Bubble */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-full max-w-xs">
            <motion.div
              key={barkerPhrase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-100 text-red-900 px-4 py-2 rounded-lg font-creepy text-xs border-2 border-red-900 shadow-[4px_4px_0px_rgba(139,0,0,1)]"
            >
              {barkerPhrase}
            </motion.div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={prevMaze}
              data-testid="button-prev-ride"
              className="p-2 text-red-600 hover:text-red-400 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 bg-red-950/40 border-2 border-red-900/50 p-6 rounded-lg backdrop-blur-md relative overflow-hidden group hover:border-red-600/70 transition-colors"
              >
                <div className="hud-dash-meter-grid absolute inset-0 opacity-20" />
                <h2 className="font-horror text-2xl text-amber-500 mb-2">
                  {mazes[currentIndex].title || `NIGHTMARE ${mazes[currentIndex].hash.slice(0, 4).toUpperCase()}`}
                </h2>
                <p className="text-amber-100/70 font-creepy text-sm h-12 overflow-hidden italic">
                  "{mazes[currentIndex].description || "The circus never ends. The laughter never stops."}"
                </p>
                <div className="mt-4 flex justify-between text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  <span>Performers: {mazes[currentIndex].performers}</span>
                  <span>Backdrops: {mazes[currentIndex].backdrops}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={nextMaze}
              data-testid="button-next-ride"
              className="p-2 text-red-600 hover:text-red-400 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="pt-8">
            {/* Seed input and randomize button */}
            <div className="flex items-center space-x-2 mb-4">
              <input
                data-testid="input-seed"
                placeholder="Enter Seed Words..."
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="bg-gray-800 text-white p-2 rounded w-48"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setSeed('');
                  // Generate a simple random seed (e.g., three random words)
                  const words = ['red', 'clown', 'laugh', 'night', 'maze', 'ghost', 'shadow'];
                  const randomSeed = Array.from({ length: 3 }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
                  setSeed(randomSeed);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white"
                data-testid="button-random-seed"
              >
                Randomize
              </Button>
            </div>
            <Button
              type="button"
              size="lg"
              onClick={handleStart}
              className="bg-red-900 hover:bg-red-800 text-white font-horror tracking-wider text-2xl px-12 py-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,0,0,0.5)] border-4 border-double border-red-600"
              data-testid="button-start-game"
            >
              ENTER MAZE
            </Button>
          </div>

          <div className="mt-4 flex justify-center gap-1">
            {mazes.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-4 bg-red-500' : 'w-1 bg-red-900/50'}`}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-12 text-xs text-red-900/60 font-mono space-y-1"
        >
          <p className="animate-pulse">WARNING: GYROSCOPE & HAPTICS RECOMMENDED</p>
          <p>HEADPHONES REQUIRED FOR FULL EXPERIENCE</p>
        </motion.div>

        {/* Decorative clown elements */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-6xl opacity-10 animate-bounce">
          🎪
        </div>
      </motion.div>

      {/* Inline keyframes for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
