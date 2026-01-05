import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useGameStore } from '../../game/store';

export function InteractionPrompt() {
  const {
    nearbyItem,
    nearbyExit,
    collectNearbyItem,
    triggerExitInteraction,
    showCollectedPopup,
    clearCollectedPopup,
    itemInventory,
    isGameOver,
    hasWon,
  } = useGameStore();

  useEffect(() => {
    if (showCollectedPopup) {
      const timer = setTimeout(() => {
        clearCollectedPopup();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showCollectedPopup, clearCollectedPopup]);

  if (isGameOver || hasWon) return null;

  return (
    <>
      {/* Item Inventory Counter */}
      {itemInventory > 0 && (
        <div
          className="absolute top-40 left-4 z-50 pointer-events-none"
          data-testid="display-inventory"
        >
          <div className="bg-amber-900/80 border-2 border-amber-600/50 rounded-lg px-3 py-2">
            <div className="text-amber-200 font-mono text-sm">
              <span className="text-amber-400">ITEMS:</span> {itemInventory}
            </div>
          </div>
        </div>
      )}

      {/* Collection Popup */}
      <AnimatePresence>
        {showCollectedPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-b from-amber-600 to-amber-800 border-4 border-yellow-400 rounded-xl px-6 py-4 shadow-2xl">
              <div className="text-yellow-300 font-creepy text-xl text-center mb-1">COLLECTED!</div>
              <div className="text-white font-bold text-lg text-center">
                {showCollectedPopup.name}
              </div>
              <div className="text-green-300 text-sm text-center mt-2">-5 FEAR -5 DESPAIR</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nearby Item Prompt */}
      <AnimatePresence>
        {nearbyItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-48 left-1/2 -translate-x-1/2 z-50"
          >
            <button
              data-testid="button-collect-item"
              onClick={collectNearbyItem}
              className="pointer-events-auto bg-gradient-to-b from-yellow-500 to-amber-700 
                         border-4 border-yellow-300 rounded-xl px-8 py-4 
                         shadow-[0_0_30px_rgba(255,200,0,0.6)] 
                         hover:shadow-[0_0_50px_rgba(255,200,0,0.9)]
                         active:scale-95 transition-all duration-200"
            >
              <div className="text-white font-creepy text-2xl mb-1 drop-shadow-lg">
                TAP TO COLLECT
              </div>
              <div className="text-yellow-200 font-bold text-lg text-center">{nearbyItem.name}</div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nearby Exit Prompt */}
      <AnimatePresence>
        {nearbyExit && !nearbyItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-48 left-1/2 -translate-x-1/2 z-50"
          >
            <button
              data-testid="button-escape-exit"
              onClick={triggerExitInteraction}
              className="pointer-events-auto bg-gradient-to-b from-green-500 to-green-700 
                         border-4 border-green-300 rounded-xl px-10 py-5 
                         shadow-[0_0_40px_rgba(0,255,100,0.7)] 
                         hover:shadow-[0_0_60px_rgba(0,255,100,0.9)]
                         active:scale-95 transition-all duration-200
                         animate-pulse"
            >
              <div className="text-white font-creepy text-3xl drop-shadow-lg">🚪 ESCAPE! 🚪</div>
              <div className="text-green-200 font-bold text-lg text-center mt-1">
                TAP TO EXIT THE MAZE
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
