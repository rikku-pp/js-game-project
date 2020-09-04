import React, { createContext, useContext, useState, useEffect } from 'react'

import { apiUrl, apiOptions, createQueryString } from '../api-utils'
import { PlayerContext } from './'
import useFetch from 'use-http'

export const createEmptyGrid = () => ({
  data: Array.from({ length: 36 }, () => ['']),
  isSubmitted: false,
  gridId: '',
  progress: 0
})

const getGridProgress = (gridData) => gridData.reduce((acc, next) => acc + Number(!!next[0]), 0)
const reconcileData = (localData, serverData) =>
  localData.map((cell, i) => (serverData[i][1] ? serverData[i] : cell))

export const GridContext = createContext({
  myGrid: createEmptyGrid(),
  localGrid: createEmptyGrid(),
  preparationGrid: createEmptyGrid(),
  setLocalGrid: () => {},
  putGrid: () => {},
  pauseGridSync: () => {}
})

export const GridContextProvider = ({ children }) => {
  const { myTokens, myPlayer, players } = useContext(PlayerContext)
  const [grid, setGrid] = useState(createEmptyGrid())
  const [localGrid, setLocalGrid] = useState(createEmptyGrid())
  const [preparationGrid, setPreparationGrid] = useState(createEmptyGrid())
  const [isPaused, setPaused] = useState(false)
  const [request, response] = useFetch(`${apiUrl}/grid`, apiOptions)

  useEffect(
    function didReceivePlayerUpdates() {
      async function getGrid() {
        const latestGrid = await request.get(
          createQueryString({
            playerUuid: myTokens.uuid,
            gridId: myPlayer.grid
          })
        )
        if (response.ok) {
          setGrid(latestGrid)
        }
      }
      getGrid()
    },
    [request, response, myTokens.uuid, myPlayer.grid, players, players.rounds]
  )

  useEffect(
    function willReceiveGridUpdates() {
      try {
        if (!isPaused) {
          if (grid.progress === 36) {
            setLocalGrid(grid)
          } else if (localGrid.progress < 36 || !localGrid.isSubmitted) {
            const newData = reconcileData(localGrid.data, grid.data)
            setLocalGrid({ ...grid, data: newData, progress: getGridProgress(newData) })
          } else {
            setLocalGrid(grid)
          }
        }
      } catch (e) {}
    },
    [grid] // eslint-disable-line
  )

  useEffect(
    function didReplaceGridId() {
      if (isPaused) {
        setPaused(false)
        const newData = preparationGrid
          ? {
              hidden: false,
              isSubmitted: false,
              gridId: myPlayer.grid,
              data: preparationGrid.data.map((cell) => [...cell]),
              progress: preparationGrid.data.reduce((acc, next) => acc + Number(!!next[0]), 0)
            }
          : createEmptyGrid()
        setLocalGrid(newData)
        setPreparationGrid(createEmptyGrid())
      }
    },
    [myPlayer.grid] // eslint-disable-line
  )

  return (
    <GridContext.Provider
      value={{
        myGrid: grid || createEmptyGrid(),
        localGrid: localGrid || createEmptyGrid(),
        preparationGrid: preparationGrid || createEmptyGrid(),
        setLocalGrid,
        setPreparationGrid,
        putGrid: request.put,
        createEmptyGrid,
        pauseGridSync: setPaused,
        isGridSyncPaused: isPaused
      }}
    >
      {children}
    </GridContext.Provider>
  )
}
