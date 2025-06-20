export const TRANSITION_PROPS = {
  spring: {
    type: 'spring',
    stiffness: 200,
    damping: 60,
    mass: 3,
  },
  ease: {
    type: 'ease',
    ease: 'easeInOut',
    duration: 0.4,
  },
} as const;

// Dots will be rendered if their number
// is below the threhold
export const PROGRESS_BAR_THRESHOLDS = {
  SINGLE_ITEM: 10,
  TWO_ITEMS: 18,
  THREE_OR_MORE: 25,
  MIN_WIDTH: 300,
} as const;
