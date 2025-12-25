// Unified animation configuration system

export interface AnimationPreset {
  type: string;
  duration: number;
  delay: number;
  easing: string;
}

export const ANIMATION_PRESETS: Record<string, AnimationPreset> = {
  // Headers
  header: {
    type: 'fade-down',
    duration: 600,
    delay: 0,
    easing: 'ease-out-cubic',
  },
  
  // Content sections
  content: {
    type: 'fade-up',
    duration: 500,
    delay: 150,
    easing: 'ease-out-cubic',
  },
  
  // Cards/items in sequence
  card: {
    type: 'fade-up',
    duration: 500,
    delay: 0,
    easing: 'ease-out-cubic',
  },
  
  // Zoom effects
  zoom: {
    type: 'zoom-in',
    duration: 500,
    delay: 0,
    easing: 'ease-out-cubic',
  },
  
  // Side animations
  left: {
    type: 'fade-left',
    duration: 500,
    delay: 0,
    easing: 'ease-out-cubic',
  },
  right: {
    type: 'fade-right',
    duration: 500,
    delay: 0,
    easing: 'ease-out-cubic',
  },
  
  // Hero elements
  hero: {
    type: 'fade-down',
    duration: 700,
    delay: 0,
    easing: 'ease-out-cubic',
  },
  
  // CTA buttons
  cta: {
    type: 'zoom-in',
    duration: 600,
    delay: 0,
    easing: 'ease-out-cubic',
  },
};

export function getAnimationAttributes(preset: string, index: number = 0, baseDelay: number = 0): string {
  const config = ANIMATION_PRESETS[preset] || ANIMATION_PRESETS.content;
  const delay = baseDelay + config.delay + (index * 50);
  
  return `data-reveal="${config.type}" data-reveal-duration="${config.duration}" data-reveal-delay="${delay}" data-reveal-easing="${config.easing}"`;
}

export function getStaggeredDelay(index: number, baseDelay: number = 0, increment: number = 50): number {
  return baseDelay + (index * increment);
}

export const ANIMATION_DURATIONS = {
  fast: 300,
  normal: 500,
  slow: 700,
  slower: 800,
} as const;

export const ANIMATION_DELAYS = {
  none: 0,
  short: 50,
  medium: 100,
  long: 150,
  longer: 200,
  longest: 300,
} as const;

export const ANIMATION_TYPES = {
  fadeUp: 'fade-up',
  fadeDown: 'fade-down',
  fadeLeft: 'fade-left',
  fadeRight: 'fade-right',
  fade: 'fade',
  zoomIn: 'zoom-in',
  zoomOut: 'zoom-out',
} as const;
