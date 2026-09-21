import { Variants } from 'motion/react';
import { AppScreen } from '../types';

/**
 * Screen archetype classifier for tailored navigation animations
 */
export type ScreenArchetype = 'home' | 'portal' | 'questionnaire' | 'directory' | 'catalog' | 'profile' | 'selection';

export function getScreenArchetype(screen: AppScreen): ScreenArchetype {
  switch (screen) {
    case 'home':
      return 'home';
    case 'owner-portal':
    case 'vet-portal':
      return 'portal';
    case 'questionnaire-owner':
    case 'questionnaire-vet':
      return 'questionnaire';
    case 'dz-directory':
      return 'directory';
    case 'articles':
    case 'adoption':
    case 'marketplace':
    case 'ideas':
    case 'videos':
      return 'catalog';
    case 'profile':
      return 'profile';
    case 'roles':
      return 'selection';
    default:
      return 'home';
  }
}

/**
 * High-performance cubic bezier easing curves
 */
export const EASING = {
  // Smooth natural decel for entering elements
  easeOutCubic: [0.22, 1, 0.36, 1],
  // Snappy smooth exit
  easeInCubic: [0.32, 0, 0.67, 0],
  // Expressive responsive spring-like curve
  springSmooth: [0.16, 1, 0.3, 1],
  // Fast pop for modal backdrops
  swift: [0.4, 0, 0.2, 1],
} as const;

/**
 * Specific Screen Transition Variants by Screen Type
 */
export const screenArchetypeVariants: Record<ScreenArchetype, Variants> = {
  home: {
    initial: {
      opacity: 0,
      scale: 0.985,
      y: 16,
      filter: 'blur(4px)',
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.38,
        ease: EASING.easeOutCubic,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.985,
      y: -12,
      filter: 'blur(3px)',
      transition: {
        duration: 0.22,
        ease: EASING.swift,
      },
    },
  },
  portal: {
    initial: {
      opacity: 0,
      scale: 0.98,
      y: 20,
      filter: 'blur(5px)',
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.42,
        ease: EASING.springSmooth,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.985,
      y: -16,
      filter: 'blur(3px)',
      transition: {
        duration: 0.22,
        ease: EASING.swift,
      },
    },
  },
  questionnaire: {
    initial: {
      opacity: 0,
      y: 24,
      scale: 0.99,
      filter: 'blur(4px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.36,
        ease: EASING.easeOutCubic,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.99,
      filter: 'blur(3px)',
      transition: {
        duration: 0.2,
        ease: EASING.swift,
      },
    },
  },
  directory: {
    initial: {
      opacity: 0,
      x: 20,
      filter: 'blur(4px)',
    },
    animate: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.36,
        ease: EASING.easeOutCubic,
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      filter: 'blur(3px)',
      transition: {
        duration: 0.2,
        ease: EASING.swift,
      },
    },
  },
  catalog: {
    initial: {
      opacity: 0,
      y: 18,
      scale: 0.992,
      filter: 'blur(3px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.35,
        ease: EASING.easeOutCubic,
      },
    },
    exit: {
      opacity: 0,
      y: -14,
      scale: 0.992,
      filter: 'blur(3px)',
      transition: {
        duration: 0.2,
        ease: EASING.swift,
      },
    },
  },
  profile: {
    initial: {
      opacity: 0,
      scale: 0.97,
      y: 16,
      filter: 'blur(4px)',
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.38,
        ease: EASING.springSmooth,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.97,
      y: -12,
      filter: 'blur(3px)',
      transition: {
        duration: 0.2,
        ease: EASING.swift,
      },
    },
  },
  selection: {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.985,
      filter: 'blur(4px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.36,
        ease: EASING.easeOutCubic,
      },
    },
    exit: {
      opacity: 0,
      y: -18,
      scale: 0.985,
      filter: 'blur(3px)',
      transition: {
        duration: 0.22,
        ease: EASING.swift,
      },
    },
  },
};

/**
 * Tab Content Transition with smooth fade and slide
 */
export const tabContentVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.995,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: EASING.easeOutCubic,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.995,
    transition: {
      duration: 0.16,
      ease: EASING.swift,
    },
  },
};

/**
 * Step Question Transition for Questionnaires
 */
export const stepTransitionVariants: Variants = {
  initial: (direction: number = 1) => ({
    opacity: 0,
    x: direction > 0 ? 30 : -30,
    filter: 'blur(3px)',
  }),
  animate: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.32,
      ease: EASING.easeOutCubic,
    },
  },
  exit: (direction: number = 1) => ({
    opacity: 0,
    x: direction > 0 ? -25 : 25,
    filter: 'blur(2px)',
    transition: {
      duration: 0.18,
      ease: EASING.swift,
    },
  }),
};

/**
 * Mobile Navigation Drawer Transition
 */
export const navDrawerVariants: Variants = {
  initial: {
    opacity: 0,
    height: 0,
    y: -12,
  },
  animate: {
    opacity: 1,
    height: 'auto',
    y: 0,
    transition: {
      duration: 0.28,
      ease: EASING.springSmooth,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: EASING.swift,
    },
  },
};

/**
 * Modal & Drawer Dialog Transitions
 */
export const modalBackdropVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.25,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      delay: 0.05,
    },
  },
};

export const modalDialogVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 18,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: EASING.springSmooth,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: {
      duration: 0.18,
      ease: EASING.swift,
    },
  },
};

/**
 * Staggered Card Grid & Item Variants with Exit Support
 */
export const cardGridVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

export const cardItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 14,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: EASING.easeOutCubic,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.15,
      ease: EASING.swift,
    },
  },
};
