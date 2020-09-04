import React from 'react'
import { AngleToDirection } from './utils'
import { useSpring, animated } from 'react-spring'

export const PlayerSubItem = ({
  xor,
  avatarSize,
  align,
  angle,
  selected,
  display,
  onClick,
  children
}) => {
  const subItemRatio = 3 / 4
  const fullOffset = avatarSize / 2
  const partialOffset = avatarSize / 3

  const hiddenPosition = AngleToDirection(
    {
      right: ` translate(${fullOffset}px, -${partialOffset}px)`,
      bottom: ` translate(-${partialOffset}px, ${fullOffset}px)`,
      left: ` translate(-${fullOffset}px, -${partialOffset}px)`,
      top: ` translate(-${partialOffset}px, -${fullOffset}px)`
    },
    angle
  )

  const position = AngleToDirection(
    {
      right: (crossFactor) =>
        ` translate(0px, ${crossFactor * avatarSize * subItemRatio + (-1 * avatarSize) / 3}px)`,
      bottom: (crossFactor) =>
        ` translate(${crossFactor * avatarSize * subItemRatio + (-1 * avatarSize) / 3}px, 0px)`,
      left: (crossFactor) =>
        ` translate(0px, ${crossFactor * avatarSize * subItemRatio + (-1 * avatarSize) / 3}px)`,
      top: (crossFactor) =>
        ` translate(${crossFactor * avatarSize * subItemRatio + (-1 * avatarSize) / 3}px, 0px)`
    },
    angle
  )(xor)

  const props = useSpring({
    config: { mass: 1, tension: 350, friction: 23 },
    width: subItemRatio * avatarSize,
    height: subItemRatio * avatarSize,
    top: 'top' === align ? subItemRatio * avatarSize : 'unset',
    bottom: 'bottom' === align ? subItemRatio * avatarSize : 'unset',
    left: 'left' === align ? subItemRatio * avatarSize : 'unset',
    right: 'right' === align ? subItemRatio * avatarSize : 'unset',
    transform: display ? position : hiddenPosition
  })

  return (
    <animated.div style={props} className={selected ? 'selected' : undefined} onClick={onClick}>
      {children}
    </animated.div>
  )
}
