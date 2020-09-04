import React, { useContext, useState, useEffect } from 'react'
import classnames from 'classnames'
import { PlayerContext, GridContext } from '../../contexts'
import { GridGame, GridPreparation } from './'
import './Grid.css'

const wrapUpdate = (playerUuid, grid, isPreparationGrid) => ({
  playerUuid: playerUuid,
  gridId: grid.gridId,
  inputData: grid.data,
  isPreparationGrid
})

export const GridContainer = ({
  styles,
  cursor,
  children,
  clientGameState,
  onProgress,
  actionEvent
}) => {
  const { myTokens } = useContext(PlayerContext)
  const {
    putGrid,
    localGrid,
    setLocalGrid,
    preparationGrid,
    setPreparationGrid,
    pauseGridSync
  } = useContext(GridContext)
  const [lastEvent, setLastEvent] = useState()
  const isPreparationGrid = clientGameState.PLAYER_DESIGNING_WHILE_WAITING

  useEffect(
    function resetProgress() {
      localGrid.progress === 0 && onProgress(0)
    },
    [localGrid.progress, onProgress]
  )

  useEffect(() => {
    if (actionEvent !== lastEvent) {
      setLastEvent(actionEvent)

      switch (actionEvent.type) {
        case 'Examine Pattern':
        case 'Finalize Pattern':
          const currentGrid = isPreparationGrid ? preparationGrid : localGrid
          putGrid(
            Object.assign(
              { doSubmit: true },
              wrapUpdate(myTokens.uuid, currentGrid, isPreparationGrid)
            )
          )
          setLocalGrid(Object.assign({}, currentGrid, { isSubmitted: true, hidden: false }))
          pauseGridSync(false)
          break
        case 'Clue Request':
          putGrid(wrapUpdate(myTokens.uuid, localGrid))
          break
        case 'Design Next':
          setPreparationGrid({ ...preparationGrid, progress: 0 })
          setLocalGrid({ ...localGrid, hidden: true })
          pauseGridSync(true)
          break
        default:
          break
      }
    }
  }, [
    localGrid,
    preparationGrid,
    setPreparationGrid,
    myTokens.uuid,
    lastEvent,
    actionEvent,
    putGrid,
    setLocalGrid,
    isPreparationGrid,
    pauseGridSync
  ])

  return (
    <div>
      {children}
      <div style={styles} className={classnames('grid', cursor)}>
        <style>
          {`
            .grid > div.grid-cell {
              line-height:${styles.minHeight / 6 - 4}px;
              font-size: ${styles.minHeight / 14}px;
            }
          `}
        </style>

        {!localGrid.hidden && <GridGame cursor={cursor} onProgress={onProgress} />}

        {isPreparationGrid && <GridPreparation cursor={cursor} onProgress={onProgress} />}
      </div>
    </div>
  )
}
