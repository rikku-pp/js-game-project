const Grid = require('../model/Grid')
const Player = require('../model/Player')
const { notifyAll } = require('../events')

module.exports = {}

const addGrid = async (ctx) => {
  ctx.status = 418
}

const getGrid = async (ctx) => {
  const grid = Grid.getGrid(ctx.request.query.playerUuid, ctx.request.query.gridId)
  if (grid) {
    ctx.response.body = grid
    return
  }

  const players = Player.getPlayerState()
  const isHistorical = players.find(([uuid, obj]) =>
    obj.rounds.find((round) => round.grid === ctx.request.query.gridId)
  )
  const ownPlayer = players.find(([uuid]) => uuid === ctx.request.query.playerUuid)
  const ownGrid = (ownPlayer && Grid.getGrid(ownPlayer[0], ownPlayer[1].grid)) || {}
  const isDesigner = ownPlayer && ownPlayer[1].isDesigner

  if (isHistorical) {
    if (!ownGrid.isSubmitted) return (ctx.status = 403) // forbidden

    ctx.response.body = Grid.getGrid(isHistorical[0], ctx.request.query.gridId)
    return
  }

  if (isDesigner) {
    const target = players.find(([uuid, obj]) => obj.grid === ctx.request.query.gridId)
    const targetUuid = target && target[0]
    ctx.response.body = Grid.getGrid(targetUuid, ctx.request.query.gridId)
    return
  }

  ctx.status = 204
}

const updatePreparationGrid = (ctx, { playerUuid, inputData }) => {
  try {
    const gridId = Grid.newGrid(playerUuid)
    const newData = Grid.newPreparedGrid({ playerUuid, gridId, inputData })

    const playerUpdated = Player.updatePreparationGrid({ playerUuid, gridId })

    if (newData && playerUpdated) {
      notifyAll()
      return (ctx.status = 202) // Accepted
    }

    ctx.status = 204 // No change
  } catch (error) {
    console.log(error)
    ctx.status = 500 // Internal server error
  }
}

const updateGrid = async (ctx) => {
  try {
    let { playerUuid, gridId, inputData, doSubmit, isPreparationGrid } = ctx.request.body

    const playerExist = Player.getPlayerState().find(([storedUuid]) => storedUuid === playerUuid)
    if (!playerExist) return (ctx.res.statusMessage = 'Unknown player') && (ctx.status = 400) // Bad request

    const inputOk =
      Array.isArray(inputData) && inputData.length === 36 && Array.isArray(inputData[0])
    if (!inputOk) return (ctx.status = 400) && (ctx.message = 'Bad grid data') // Bad request

    if (isPreparationGrid) return updatePreparationGrid(ctx, { playerUuid, inputData })

    let prevGrid = Grid.getGrid(playerUuid, gridId)
    if (gridId === '') {
      gridId = Grid.newGrid(playerUuid)
      prevGrid = Grid.getGrid(playerUuid, gridId)
      Player.updatePlayerGrid({ playerUuid, gridId, gridProgress: 0 })
    }
    if (!prevGrid || !Array.isArray(prevGrid.data) || prevGrid.data.length !== inputData.length)
      return (ctx.status = 400) && (ctx.message = 'Unknown grid Id') // Bad request

    const designer = Player.getPlayerObjects().find((player) => player.isDesigner)

    const newData = Grid.updateGrid({
      playerUuid,
      grid: gridId,
      inputData,
      doSubmit,
      designerGridId: designer.grid
    })
    if (!newData) return 422 // Unprocessable entity

    const playerUpdated = Player.updatePlayerGrid({
      playerUuid,
      gridId,
      gridProgress: newData.reduce((acc, next) => acc + Number(!!next[0]), 0)
    })

    if (newData && playerUpdated) {
      notifyAll()
      return (ctx.status = 202) // Accepted
    }

    ctx.status = 204 // No change
  } catch (error) {
    console.log(error)
    ctx.status = 500 // Internal server error
  }
}

const clearGrids = async (ctx) => {
  ctx.status = Grid.clearGrids()
}

module.exports = {
  addGrid,
  getGrid,
  updateGrid,
  clearGrids
}
