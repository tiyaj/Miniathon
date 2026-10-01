/**
 * PULSE — Global Motion System & Choreography Presets
 * Signature editorial easing, precise durations, and reusable Framer Motion variants.
 */

// Signature Editorial Easings
export const EASINGS = {
  expoOut: [0.16, 1, 0.3, 1], // Signature dramatic entrance
  softOut: [0.22, 1, 0.36, 1], // Subtle physical hover
  smoothInOut: [0.65, 0, 0.35, 1],
};

// Durations (in seconds)
export const DURATIONS = {
  instant: 0.15,
  hover: 0.32,
  reveal: 0.95,
  revealLong: 1.15,
  draw: 1.05,
  stagger: 0.08,
};

// Reusable Framer Motion Variants

/**
 * Stagger Container
 */
export const staggerParent = (staggerTime = DURATIONS.stagger, delayChildren = 0.1) => ({
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerTime,
      delayChildren,
    },
  },
});

/**
 * Masked Line/Word Reveal: child animates from behind overflow:hidden
 */
export const maskRevealChild = {
  hidden: {
    y: "115%",
    opacity: 0,
  },
  visible: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: DURATIONS.reveal,
      ease: EASINGS.expoOut,
    },
  },
};

/**
 * Standard Editorial Fade Up
 */
export const fadeUp = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATIONS.reveal,
      ease: EASINGS.expoOut,
    },
  },
};

/**
 * Hairline Draw: scaleX from 0 to 1 with origin left
 */
export const drawLine = {
  hidden: {
    scaleX: 0,
    transformOrigin: "left",
  },
  visible: {
    scaleX: 1,
    transition: {
      duration: DURATIONS.draw,
      ease: EASINGS.expoOut,
    },
  },
};

/**
 * Ledger Row Reveal
 */
export const ledgerRow = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: EASINGS.expoOut,
    },
  },
};
