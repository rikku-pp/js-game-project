import React from 'react'
import classnames from 'classnames'
import './MarkButton.css'

export const SYMBOLS = {
  circle: '⚫',
  square: '🔲',
  diamond: '🔷',
  plus: '➕',
  mark: '❓'
}

export const MarkButton = ({ cursor, setCursor, char, charName }) => {
  return (
    <div
      className={classnames('mark-button', cursor === charName && 'selected')}
      onClick={() => setCursor(charName === cursor ? '' : charName)}
    >
      {char}
    </div>
  )
}
export const MarkButtonContainer = ({ cursor, setCursor }) => (
  <div className="mark-button-container">
    <MarkButton
      cursor={cursor}
      setCursor={setCursor}
      char={SYMBOLS['circle']}
      charName={'circle'}
    />
    <MarkButton
      cursor={cursor}
      setCursor={setCursor}
      char={SYMBOLS['square']}
      charName={'square'}
    />
    <MarkButton
      cursor={cursor}
      setCursor={setCursor}
      char={SYMBOLS['diamond']}
      charName={'diamond'}
    />
    <MarkButton cursor={cursor} setCursor={setCursor} char={SYMBOLS['plus']} charName={'plus'} />
  </div>
)
