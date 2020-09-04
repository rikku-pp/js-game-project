import React from 'react'
import './PlayerName.css'

const alignSwitch = (align, offset) => {
  switch (align) {
    case 'top':
      return { left: offset, textAlign: 'left', alignItems: 'center' }
    case 'bottom':
      return {
        bottom: 0,
        left: offset,
        textAlign: 'left',
        alignItems: 'center'
      }
    case 'left':
      return {
        top: offset,
        textAlign: 'center',
        alignItems: 'flex-start'
      }
    case 'right':
    default:
      return {
        right: 0,
        top: offset,
        textAlign: 'center',
        alignItems: 'flex-start'
      }
  }
}

export const PlayerName = ({ align, name, isMyPlayer, avatarSize, isDesigner }) => {
  const offset = avatarSize / 2 + 5
  const styles = alignSwitch(align, offset)

  return (
    <div className="player-name" style={{ height: avatarSize, width: avatarSize, ...styles }}>
      {(isDesigner ? '🎨 ' : '') + name + (isMyPlayer ? ' (You)' : '')}
    </div>
  )
}
