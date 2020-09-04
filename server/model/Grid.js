const { getPlayerObjects, getPlayerConnection } = require('./Player')
const uuid = require('uuid').v4

module.exports = {}

let grids = {}

const newGrid = (playerUuid) => {
  const data = Array.from({ length: 36 }, () => [''])
  const gridId = uuid()
  !grids[playerUuid] && (grids[playerUuid] = {})
  grids[playerUuid][gridId] = { data, isSubmitted: false, gridId, progress: 0 }
  return gridId
}

const newPreparedGrid = ({ playerUuid, gridId, inputData }) => {
  try {
    const newData = []

    for (let i = 0; i < inputData.length; i++) {
      if (Array.isArray(inputData[i]) && typeof inputData[i][0] === 'string') {
        newData[i] = Array.from(inputData[i])
      }
    }

    grids[playerUuid][gridId].data = newData
    grids[playerUuid][gridId].isSubmitted = true
    grids[playerUuid][gridId].progress = newData.reduce(
      (acc, next) => acc + Number(!!next[0] && next[0] !== '❓'),
      0
    )
    return newData
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
}

const getGrid = (playerUuid, gridId) => {
  if (!grids) return undefined
  const playerGrid = grids[playerUuid] || {}
  return playerGrid[gridId]
}

const getProgress = (...args) => getGrid(...args).progress

const updateGrid = ({ playerUuid, grid, inputData, doSubmit, designerGridId }) => {
  try {
    const gridId = grid || newGrid(playerUuid)
    const prevGrid = getGrid(playerUuid, gridId)
    const prevData = prevGrid.data
    const isDesigner = designerGridId === gridId
    const newData = []

    for (let i = 0; i < prevData.length; i++) {
      const isPrevClued = prevData[i][1] === '❓'
      const isEmpty = prevData[i][0] === ''
      const isClueMark = Array.isArray(inputData[i]) && inputData[i][0] === '❓'
      const designerGridObj = Object.values(grids).find((obj) => !!obj[designerGridId]) || {}
      const designerGrid = designerGridObj[designerGridId] || []
      const isIncorrect = designerGrid.data[i][0] !== inputData[i][0]

      if (isClueMark && !isPrevClued && !isDesigner) {
        newData[i] = [designerGrid.data[i][0], '❓']
      } else if (isDesigner && doSubmit && isEmpty) {
        newData[i] = inputData[i]
      } else if (!isDesigner && doSubmit && isIncorrect) {
        newData[i] = [inputData[i][0], '', '❗']
      } else if (isEmpty) {
        newData[i] = [inputData[i][0]]
      } else {
        newData[i] = prevData[i]
      }
    }
    // update in(-memory) storage
    grids[playerUuid][gridId].data = newData
    grids[playerUuid][gridId].isSubmitted = doSubmit
    grids[playerUuid][gridId].progress = newData.reduce(
      (acc, next) => acc + Number(!!next[0] && next[0] !== '❓'),
      0
    )

    return newData
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
}

const getPoints = ({ playerUuid, gridId }) => {
  try {
    return grids[playerUuid][gridId].data.reduce((acc, next) => {
      if (next[1] === '❓') {
        return acc
      } else if (next[2] === '❗') {
        return acc - 1
      }
      return acc + 1
    }, 0)
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
}

const clearGrids = () => {
  const connectedPlayers = Object.values(getPlayerConnection())
  const activePlayers = getPlayerObjects().filter((p) => p.isInactive === false)
  if (activePlayers <= 1 && connectedPlayers.length <= 1) {
    grids = {}
    return 204 // No content
  }
  return 406 // Not acceptable
}

module.exports = {
  newGrid,
  newPreparedGrid,
  getGrid,
  updateGrid,
  getPoints,
  getProgress,
  clearGrids
}
