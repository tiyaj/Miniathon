import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const RouteWipeContext = createContext({
  wipeTo: () => {},
  isWiping: false,
});

export function RouteWipeProvider({ children }) {
  const navigate = useNavigate();
  const [isWiping, setIsWiping] = useState(false);

  const wipeTo = useCallback(
    (targetPath) => {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        navigate(targetPath);
        return;
      }

      setIsWiping(true);

      // 550ms wipe before navigating into the cream dashboard world
      setTimeout(() => {
        navigate(targetPath);
        // Clean up wipe state after dashboard mounts
        setTimeout(() => {
          setIsWiping(false);
        }, 300);
      }, 550);
    },
    [navigate]
  );

  return (
    <RouteWipeContext.Provider value={{ wipeTo, isWiping }}>
      {children}
      <AnimatePresence>
        {isWiping && (
          <motion.div
            id="pulse-route-wipe-overlay"
            initial={{ transform: 'translateX(-100%)' }}
            animate={{ transform: 'translateX(0%)' }}
            exit={{ transform: 'translateX(100%)' }}
            transition={{
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1], // cinematic hard-edge deceleration
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: '#F3F0E8', // Signature PULSE cream paper
              zIndex: 9999,
              pointerEvents: 'all',
              boxShadow: '-20px 0 50px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 1px PULSE Vermilion hairline on the leading edge */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '2px',
                height: '100%',
                backgroundColor: '#F5452C',
                boxShadow: '0 0 12px #F5452C',
              }}
            />

            {/* Faint watermark in cream during sweep */}
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.85rem',
                letterSpacing: '0.2em',
                color: 'rgba(23, 21, 15, 0.35)',
                textTransform: 'uppercase',
              }}
            >
              INITIALIZING COMMAND REPOSITORY // LIVE OPS
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </RouteWipeContext.Provider>
  );
}

export function useRouteWipe() {
  return useContext(RouteWipeContext);
}

export default RouteWipeProvider;
