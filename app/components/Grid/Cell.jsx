import React from 'react'
import classnames from 'classnames'
import { SYMBOLS } from './MarkButton'
import './Cell.css'

export const Cell = ({
  char,
  index,
  interactionMode,
  failModifier,
  onPointerMove,
  onPointerDown,
  onPointerUp
}) => {
  return (
    <div
      className={classnames('grid-cell', interactionMode, failModifier)}
      id={index}
      onPointerUp={onPointerUp}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      {char}
    </div>
  )
}

export const determineNewCellData = (event, cursor, isDesigner, localGridData) => {
  return localGridData.map((cell, i) => {
    const isCellClicked = Number(event.target.id) === i
    const isCellLocked = cell.length > 1
    if (isCellClicked && !isCellLocked) {
      const isSameSymbol = cell[0] === SYMBOLS[cursor]
      const isOpenForClues = !cursor && !cell[0] && !isDesigner

      if (isSameSymbol) {
        return ['']
      }
      if (cursor) {
        return [SYMBOLS[cursor]]
      }
      if (isOpenForClues) {
        return [SYMBOLS.mark]
      }
      return ['']
    }
    return cell
  })
}
