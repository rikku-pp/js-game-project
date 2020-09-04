import React, { useContext, useEffect } from 'react'
import { GridContext } from '../../contexts'
import { usePointerEvents } from './hooks'
import { Cell, determineNewCellData } from './Cell'
import { SYMBOLS } from './MarkButton'
import './Grid.css'

export const GridPreparation = ({ cursor, onProgress, ...props }) => {
  const { preparationGrid, setPreparationGrid } = useContext(GridContext)
  const { onPointerDown, onPointerUp, onPointerMove } = usePointerEvents({
    interactionMode: 'designer',
    cursor,
    onSelect: handleClick
  })
  useEffect(
    function resetProgressOnMount() {
      setPreparationGrid(null)
      onProgress(0)
    },
    [setPreparationGrid, onProgress]
  )

  function handleClick(event) {
    event.preventDefault()
    const newData = determineNewCellData(event, cursor, true, preparationGrid.data)
    const isAltered = !!newData.find(
      (cellData, i) => cellData.join() !== preparationGrid.data[i].join()
    )
    const progress = newData.reduce((acc, next, i) => {
      return acc + Number(!!next[0] && next[0] !== SYMBOLS.mark)
    }, 0)

    if (isAltered) {
      setPreparationGrid(Object.assign({}, preparationGrid, { data: newData, progress }))
      onProgress(progress)
    }
  }

  return (
    <>
      {Array.isArray(preparationGrid.data) &&
        preparationGrid.data.map(([char], i) => (
          <Cell
            {...props}
            key={i}
            char={char}
            index={i}
            interactionMode={'designer'}
            failModifier={''}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerMove={onPointerMove}
          />
        ))}
    </>
  )
}
