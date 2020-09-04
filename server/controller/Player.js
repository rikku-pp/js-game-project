const {
  createPlayer,
  removePlayer,
  getPlayerObjects,
  getPlayerState,
  updatePlayerGrid,
  updatePlayerScores,
  setDesignerStatus,
  setActive
} = require('../model/Player')
const { newGrid, getPoints, getProgress, clearGrids } = require('../model/Grid')
const { notifyAll, unregister } = require('../events')

const { PlayerNameMaxLength } = require('../../app/constants.json')

const addPlayer = async (ctx) => {
  const sessionStarted = getPlayerObjects().find(
    (player) => player.grids && player.grids.length > 0
  )

  if (!!sessionStarted) {
    ctx.response.status = 423
    ctx.response.message = 'game-in-progress'
    ctx.response.body = { data: sessionStarted }
    return
  }

  try {
    if (ctx.request.body.name.length > PlayerNameMaxLength) return (ctx.status = 413) // Payload too large

    const newPlayerInfo = createPlayer(ctx.request.body)
    ctx.response.status = 201
    ctx.response.message = JSON.stringify(newPlayerInfo)
  } catch (err) {
    ctx.response.status = 500
    ctx.response.message = 'Unknown error, bug or issue occurred 💾🤷‍♀️🤷‍♂️📴'
  }
}

const delPlayer = async (ctx) => {
  try {
    const { uuid, name, endGame = false } = ctx.request.query

    if (endGame) {
      for (const player of getPlayerState()) {
        unregister(player[1].name, 'end-game')
        removePlayer(player[0], player[1].name)
      }
      if (getPlayerState().length === 0) {
        console.log('☢ GAME WAS RESET')
        clearGrids()
        ctx.status = 200
        ctx.response.message = `Game has been reset.`
        ctx.response.body = {}
        return
      }
    } else {
      const removedName = removePlayer(uuid, name)
      console.log(`Removed player '${removedName}'`)
      ctx.status = 200
      ctx.response.message = `Removed player '${removedName}'.`
      ctx.response.body = {}
      notifyAll()
      return
    }
  } catch (e) {
    console.warn(e)
  }

  ctx.status = 500
  ctx.response.message = 'Could not remove player.'
}

const isRestorablePlayer = ([uuid, player]) => {
  const allPlayers = getPlayerState()
  const otherActiveDesignerExist = allPlayers.find(
    ([otherUuid, otherPlayer]) =>
      uuid !== otherUuid && otherPlayer.isDesigner && !otherPlayer.isInactive
  )
  return !(player.isDesigner && otherActiveDesignerExist)
}

const getPlayers = async (ctx) => {
  const players = getPlayerState()
  const matchedPlayer = players.find(([uuid]) => uuid === ctx.query.uuid)

  if (matchedPlayer && isRestorablePlayer(matchedPlayer)) {
    ctx.body = { message: 'RESTORABLE', data: getPlayerObjects() }
    return
  }
  ctx.body = getPlayerObjects()
}

const getCurrentRound = () => {
  const activePlayers = getPlayerObjects().filter((player) => !player.isInactive)
  if (activePlayers[0] && Array.isArray(activePlayers[0].rounds)) {
    return activePlayers[0].rounds.length - 1
  }
}

const getDesignerPoints = () => {
  const currentRound = getCurrentRound()
  const { leaderScore, loserScore } = getPlayerObjects()
    .filter((player) => !player.isDesigner)
    .map((player) => (player.rounds[currentRound] && player.rounds[currentRound].points) || 0)
    .reduce(
      (acc, next) => ({
        leaderScore: next > acc.leaderScore ? next : acc.leaderScore,
        loserScore: next < acc.loserScore ? next : acc.loserScore
      }),
      { leaderScore: -36, loserScore: 36 }
    )

  const points = (leaderScore + 36 - (loserScore + 36)) * 2
  return points
}

const updatePlayers = async (ctx) => {
  const allPlayers = getPlayerState()
  const authorizedInitiator =
    ctx.query.uuid &&
    allPlayers.find(([uuid, player]) => uuid === ctx.query.uuid && player.isDesigner)
  let activePlayers = allPlayers.filter(([uuid, player]) => player.isInactive === false)
  const currentDesigner = activePlayers.find(([uuid, player]) => player.isDesigner === true)
  const sortedActivePlayers = activePlayers.sort(
    ([uuidA, playerA], [uuidB, playerB]) => playerA.order - playerB.order
  )
  const nextDesigner =
    sortedActivePlayers[
      (sortedActivePlayers.indexOf(currentDesigner) + 1) % sortedActivePlayers.length
    ]

  switch (ctx.query.action) {
    case 'init-grid-round':
      if (!authorizedInitiator) return (ctx.status = 403)

      activePlayers.forEach(([playerUuid, player]) => {
        let gridId = player.grid
        if (!player.isDesigner) {
          gridId = player.grid || newGrid(playerUuid)
          updatePlayerGrid({ playerUuid, gridId, gridProgress: 0 })
        }

        const roundCount = currentDesigner[1].rounds.length
        updatePlayerScores({
          playerUuid,
          index: roundCount === 0 ? 0 : roundCount - 1,
          points: null,
          grid: gridId
        })
      })
      notifyAll()
      ctx.status = 200
      break
    case 'next-round':
      if (!authorizedInitiator) return (ctx.status = 403)
      const currentRound = getCurrentRound()

      allPlayers.forEach(([playerUuid, player]) => {
        if (player.isInactive) {
          return removePlayer(playerUuid, player.name)
        }

        const isNextDesigner = nextDesigner[0] === playerUuid
        setDesignerStatus({ playerUuid, isNextDesigner })
        let nextGrid, initialProgress
        if (isNextDesigner) {
          nextGrid = player.preparationGrid || newGrid(playerUuid)
          initialProgress = player.preparationGrid
            ? getProgress(playerUuid, player.preparationGrid)
            : 0
        } else {
          nextGrid = newGrid(playerUuid)
          initialProgress = null
        }

        updatePlayerGrid({
          playerUuid,
          gridId: nextGrid,
          gridProgress: initialProgress
        })
        updatePlayerScores({
          playerUuid,
          index: currentRound + 1,
          points: null,
          grid: nextGrid
        })
      })

      notifyAll()
      ctx.status = 200
      break
    case 'scores':
      const playerUuid = ctx.query.uuid || ''
      const player = allPlayers.find(([uuid]) => uuid === playerUuid)[1]
      const [designerUuid, designer] = allPlayers.find(([uuid, obj]) => !!obj.isDesigner)
      const gridProgress = ctx.request.body.progress || 0
      if (!player) return (ctx.status = 400)

      if (gridProgress === 36 && !player.isDesigner) {
        updatePlayerScores({
          playerUuid,
          index: getCurrentRound(),
          points: getPoints({
            playerUuid,
            gridId: player.grid,
            designerGridId: designer.grid
          }),
          grid: player.grid
        })

        activePlayers = getPlayerState().filter(([uuid, player]) => player.isInactive === false)
        const isLastScoreOfRound =
          activePlayers.length - 1 ===
          activePlayers.filter(([uuid, player]) => {
            const current = player.rounds.find((round) => round.index === getCurrentRound())
            return !!current && typeof current.points === 'number'
          }).length

        if (isLastScoreOfRound) {
          updatePlayerScores({
            playerUuid: designerUuid,
            index: getCurrentRound(),
            points: getDesignerPoints(),
            grid: designer.grid
          })
        }
      }
      notifyAll()
      ctx.status = 200
      break
    default:
      ctx.status = 400 // Bad request
      break
  }
}

const patchPlayers = async (ctx) => {
  switch (ctx.query.action) {
    case 'restore-session':
      const matchedPlayer = getPlayerState().find(([uuid]) => uuid === ctx.query.uuid)
      if (matchedPlayer && isRestorablePlayer(matchedPlayer)) {
        setActive({ playerUuid: matchedPlayer[0] })
        ctx.status = 202
        ctx.body = { message: 'RESTORED', data: '' }
        notifyAll()
        console.log(`Restored player ${matchedPlayer[1].name}`)
        return
      } else {
        ctx.status = 409 // Conflict
        return
      }
      break
    default:
      ctx.status = 400 // Bad request
      break
  }
}

module.exports = {
  getPlayers,
  addPlayer,
  updatePlayers,
  patchPlayers,
  delPlayer
}
