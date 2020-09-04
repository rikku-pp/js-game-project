import { useTransition } from 'react-spring'

const squareNormalize = (a, b) => (Math.abs(a) < Math.abs(b) ? a : Math.sign(a))
const squareNormalizeX = ({ x, y }) => squareNormalize(x, y)
const squareNormalizeY = ({ x, y }) => squareNormalize(y, x)

export const use360Layout = length => {
  const list = Array.from({ length })

  const items = list.map((element, index, arr) => {
    const angle = (index * 2 * Math.PI) / arr.length
    const cartesian = { x: Math.cos(angle), y: Math.sin(angle) }

    const x = squareNormalizeX(cartesian)
    const y = squareNormalizeY(cartesian)

    return { ...element, index, angle, x, y }
  })

  const transform = (x, y, factor) =>
    `translateX(${factor * x * 97}%) translateY(${factor * y * 97}%)`

  const transitions = useTransition(items, item => item.index, {
    from: ({ angle, x, y }) => ({ angle, transform: transform(x, y, 0) }),
    enter: ({ angle, x, y }) => ({ angle, transform: transform(x, y, 1) }),
    update: ({ angle, x, y }) => ({ angle, transform: transform(x, y, 1) }),
    leave: ({ angle, x, y }) => ({ angle, transform: transform(x, y, 2) }),
    config: { mass: 5, tension: 500, friction: 100, duration: 250 }
  })

  return transitions
}
