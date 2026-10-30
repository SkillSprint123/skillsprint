import { useLayoutEffect, useRef } from 'react'
import { pageAnimation, pageKeyframes } from './styles'

// Animate the existing container: route changes must not remount a nano.
export const usePageTransition = (route: string) => {
  const ref = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const element = ref.current
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!element?.animate || preference.matches) return
    const animation = element.animate(pageKeyframes, pageAnimation)
    const stop = () => {
      if (preference.matches) animation.cancel()
    }
    preference.addEventListener('change', stop)
    return () => {
      animation.cancel()
      preference.removeEventListener('change', stop)
    }
  }, [route])
  return ref
}
