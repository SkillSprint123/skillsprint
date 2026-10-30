import type { PageAnimationOptions, PageKeyframes } from './types'

export const reducedMotion = '@media (prefers-reduced-motion: reduce)'
export const gentleEasing = 'cubic-bezier(0.22, 1, 0.36, 1)'

export const pageKeyframes = [
  { opacity: 0, transform: 'translateY(5px)' },
  { opacity: 1, transform: 'translateY(0)' },
] satisfies PageKeyframes

export const pageAnimation = {
  duration: 240,
  easing: gentleEasing,
} satisfies PageAnimationOptions
