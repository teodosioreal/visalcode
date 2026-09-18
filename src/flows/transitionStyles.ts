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
  'slide-down': {
    from: { opacity: 0, transform: 'translateY(-18px)' },
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
  flip: {
    from: { opacity: 0, transform: 'perspective(700px) rotateY(-90deg)' },
    to: { opacity: 1, transform: 'perspective(700px) rotateY(0deg)' },
  },
  blur: {
    from: { opacity: 0, filter: 'blur(10px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
  },
  bounce: {
    from: { opacity: 0, transform: 'scale(0.7)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  rotate: {
    from: { opacity: 0, transform: 'rotate(-8deg) scale(0.94)' },
    to: { opacity: 1, transform: 'rotate(0deg) scale(1)' },
  },
  none: { from: {}, to: {} },
}

/** "bounce" só parece um bounce de verdade com uma curva elástica —
 * força essa curva independente do easing escolhido pra esse tipo. */
const BOUNCE_EASING = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

export function transitionStyle(config: TransitionConfig, phase: 'from' | 'to'): CSSProperties {
  const easing =
    config.type === 'bounce'
      ? BOUNCE_EASING
      : config.easing === 'cubic-bezier'
        ? `cubic-bezier(${config.cubicBezier.join(',')})`
        : config.easing
  return {
    ...KEYFRAMES[config.type][phase],
    transitionProperty: 'opacity, transform, filter',
    transitionDuration: `${config.durationMs}ms`,
    transitionTimingFunction: easing,
    transitionDelay: `${config.delayMs}ms`,
  }
}
