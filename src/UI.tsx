import { useEffect, useState } from 'react';
import { useGameStore, COLORS } from './store';
import { motion, AnimatePresence } from 'motion/react';

export function UI() {
  const { status, score, setStatus, reset, switchColor } = useGameStore();
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    if (status === 'gameover') {
      if (score > highScore) setHighScore(score);
    }
  }, [status, score, highScore]);

  // Use document-level touch to avoid Canvas blocking it
  useEffect(() => {
    const handleTouch = (e: PointerEvent) => {
      if (status !== 'playing') return;
      // Dont intercept clicks on buttons or UI elements that should be clickable
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      
      e.preventDefault();
      if (e.clientX < window.innerWidth / 2) {
        switchColor();
      } else {
        window.dispatchEvent(new Event('touchJump'));
      }
    };
    
    document.addEventListener('pointerdown', handleTouch, { passive: false });
    return () => document.removeEventListener('pointerdown', handleTouch);
  }, [status, switchColor]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden font-sans select-none">
      
      {/* HUD */}
      {status === 'playing' && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="text-4xl font-black text-white drop-shadow-md">
            {score}
          </div>
        </div>
      )}

      {/* Start / Game Over Screen */}
      <AnimatePresence>
        {status !== 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center pointer-events-auto backdrop-blur-sm"
          >
            {status === 'start' ? (
              <div className="text-center">
                <h1 className="text-6xl md:text-8xl font-black text-white mb-6 uppercase tracking-tighter" style={{ WebkitTextStroke: '2px #ff2a6d' }}>
                  Chroma<br/>Run
                </h1>
                <p className="text-white/80 mb-8 max-w-md mx-auto text-lg">
                  <span className="font-bold text-[#ff2a6d]">Tap Left / A / Shift</span> to Switch Color<br/>
                  <span className="font-bold text-[#ffd700]">Tap Right / D / Space</span> to Jump
                </p>
                <button
                  onClick={() => reset()}
                  className="px-8 py-4 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-transform active:scale-95"
                >
                  START GAME
                </button>
              </div>
            ) : (
              <div className="text-center">
                <h1 className="text-7xl font-black text-red-500 mb-4 uppercase tracking-tighter">
                  Shattered
                </h1>
                <div className="text-2xl text-white mb-2">Score: {score}</div>
                <div className="text-white/60 mb-8">High Score: {highScore}</div>
                <button
                  onClick={() => reset()}
                  className="px-8 py-4 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-transform active:scale-95"
                >
                  PLAY AGAIN
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Touch Overlays (Visible only on playing) */}
      <div className={`absolute inset-0 flex pointer-events-none ${status === 'playing' ? 'opacity-10' : 'opacity-0'} transition-opacity`}>
        <div className="flex-1 border-r border-white/20 flex items-center justify-center">
          <span className="text-white font-bold text-2xl tracking-widest -rotate-90">SWITCH</span>
        </div>
        <div className="flex-1 border-l border-white/20 flex items-center justify-center">
          <span className="text-white font-bold text-2xl tracking-widest rotate-90">JUMP</span>
        </div>
      </div>
    </div>
  );
}
