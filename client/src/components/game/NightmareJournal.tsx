import { AnimatePresence, motion } from 'framer-motion';
import { Pen, Ticket, X } from 'lucide-react';
import { useState } from 'react';
import { useGameStore } from '../../game/store';

export function NightmareJournal() {
  const [isOpen, setIsOpen] = useState(false);
  const { journalEntries, fear, despair } = useGameStore();

  // Determine journal visual state based on insanity
  const insanity = (fear + despair) / 200; // 0-1
  const shake =
    insanity > 0.5 ? { x: [0, -2, 2, 0], transition: { repeat: Infinity, duration: 0.2 } } : {};

  return (
    <>
      {/* Trigger Button - Pen/Ticket Icon */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="absolute bottom-24 right-6 z-40 p-3 bg-amber-100/10 rounded-full border-2 border-amber-900/50 hover:bg-amber-100/20 transition-all group"
        aria-label="Open Nightmare Journal"
      >
        <div className="relative flex items-center justify-center w-10 h-10">
          <Ticket className="absolute w-8 h-8 text-amber-200/80 rotate-12 drop-shadow-md group-hover:scale-110 transition-transform" />
          <Pen className="absolute w-6 h-6 text-amber-100 -rotate-12 translate-x-1 -translate-y-1 drop-shadow-md group-hover:scale-110 transition-transform" />
        </div>
      </button>

      {/* Journal Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="relative w-full max-w-lg bg-[#f0e6d2] p-8 rounded-lg shadow-2xl overflow-hidden min-h-[50vh]"
              style={{
                boxShadow: '0 0 50px rgba(0,0,0,0.8) inset',
                fontFamily: 'serif',
              }}
              onClick={(e) => e.stopPropagation()}
              animate={shake}
            >
              {/* Paper Texture Overlay */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#8b4513 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-amber-900 hover:text-red-900 z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <h2
                className="text-3xl font-bold text-amber-900 mb-6 text-center border-b-2 border-amber-900/20 pb-2"
                style={{ fontFamily: 'Creepster, cursive' }}
              >
                Nightmare Journal
              </h2>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {journalEntries.length === 0 ? (
                  <p className="text-amber-900/70 text-center italic text-lg">
                    "I have just arrived. The air smells of sawdust and old popcorn... I should
                    write down what I find."
                  </p>
                ) : (
                  journalEntries.map((entry) => (
                    <div key={entry.id} className="border-b border-amber-900/10 pb-2">
                      <p
                        className={`text-lg text-amber-900 leading-relaxed ${entry.corrupted ? 'font-creepy text-red-800' : ''}`}
                        style={{ fontFamily: entry.corrupted ? 'Creepster, cursive' : 'serif' }}
                      >
                        {entry.text}
                      </p>
                      <span className="text-xs text-amber-900/40 font-mono block text-right mt-1">
                        {new Date(entry.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
