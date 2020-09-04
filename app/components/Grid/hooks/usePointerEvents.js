import { useState, useCallback } from 'react'

export const usePointerEvents = ({ interactionMode, cursor, onSelect }) => {
  const [lastTrigger, setLastTrigger] = useState({ isDown: false, id: null })
  const isInteractive =
    interactionMode === 'open' || (interactionMode === 'designer' && cursor !== '')

  const onPointerEvent = useCallback(
    (event, type) => {
      const { currentTarget: target } = event
      const isInvalidated =
        target.id !== lastTrigger.id && (!target.innerText || target.innerText !== cursor)
      switch (type) {
        case 'up':
          setLastTrigger({ isDown: type === 'down', id: null })
          break
        case 'down':
          isInteractive && isInvalidated && onSelect(event)
          setLastTrigger({ isDown: type === 'down', id: target.id })
          break
        case 'move':
          if (isInteractive && isInvalidated && !target.innerText && lastTrigger.isDown) {
            onSelect(event)
            setLastTrigger({ ...lastTrigger, id: target.id })
          }
          break
        default:
          break
      }
    },
    [lastTrigger, isInteractive, onSelect, cursor]
  )

  const onPointerDown = (e) => onPointerEvent(e, 'down')
  const onPointerUp = (e) => onPointerEvent(e, 'up')
  const onPointerMove = (e) => onPointerEvent(e, 'move')

  return { onPointerDown, onPointerUp, onPointerMove }
}
