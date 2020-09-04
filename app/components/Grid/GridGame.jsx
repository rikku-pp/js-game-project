import React, { useContext } from 'react'
import { PlayerContext, GridContext } from '../../contexts'
import { usePointerEvents } from './hooks'
import { Cell, determineNewCellData } from './Cell'
import { SYMBOLS } from './MarkButton'
import './Grid.css'

export const GridGame = ({ cursor, onProgress, ...props }) => {
  const { myPlayer } = useContext(PlayerContext)
  const { myGrid, localGrid, setLocalGrid } = useContext(GridContext)
  let interactionMode = myPlayer.isDesigner ? 'designer' : 'open'
  interactionMode = myGrid.isSubmitted ? 'submitted' : interactionMode
  interactionMode =
    !myPlayer.isDesigner && myPlayer.gridProgress === null ? 'waiting' : interactionMode

  const { onPointerDown, onPointerUp, onPointerMove } = usePointerEvents({
    interactionMode,
    cursor,
    onSelect: handleClick
  })

  function handleClick(event) {
    event.preventDefault()
    const newData = determineNewCellData(event, cursor, myPlayer.isDesigner, localGrid.data)
    const isAltered = !!newData.find((cellData, i) => cellData.join() !== localGrid.data[i].join())
    const progress = newData.reduce(
      (acc, next) => acc + Number(!!next[0] && next[0] !== SYMBOLS.mark),
      0
    )

    if (isAltered) {
      setLocalGrid(Object.assign({}, localGrid, { data: newData, progress }))
      onProgress(progress)
    }
  }

  return (
    <>
      {Array.isArray(localGrid.data) &&
        localGrid.data.map(([char, cluemark, failmark], i) => (
          <Cell
            {...props}
            key={i}
            char={char}
            index={i}
            interactionMode={cluemark ? 'clued' : interactionMode}
            failModifier={failmark ? 'incorrect' : ''}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerMove={onPointerMove}
          />
        ))}
    </>
  )
}
