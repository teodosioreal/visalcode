import type { CSSProperties } from 'react'
import type { TransitionConfig, TransitionType } from './types'

const KEYFRAMES: Record<TransitionType, { from: CSSProperties; to: CSSProperties }> = {
  fade: { from: { opacity: 0 }, to: { opacity: 1 } },
  'slide-left': {
    from: { opacity: 0, transform: 'translateX(28px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  'slide-right': {
    from: { opacity: 0, transform: 'translateX(-28px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  'slide-up': {
    from: { opacity: 0, transform: 'translateY(18px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  'step-up': {
    from: { opacity: 0, transform: 'translateY(28px) scale(0.97)' },
    to: { opacity: 1, transform: 'translateY(0) scale(1)' },
  },
  zoom: {
    from: { opacity: 0, transform: 'scale(0.92)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  none: { from: {}, to: {} },
}

export function transitionStyle(config: TransitionConfig, phase: 'from' | 'to'): CSSProperties {
  const easing =
    config.easing === 'cubic-bezier'
      ? `cubic-bezier(${config.cubicBezier.join(',')})`
      : config.easing
  return {
    ...KEYFRAMES[config.type][phase],
    transitionProperty: 'opacity, transform',
    transitionDuration: `${config.durationMs}ms`,
    transitionTimingFunction: easing,
    transitionDelay: `${config.delayMs}ms`,
  }
}
