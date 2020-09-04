const uuid = require('uuid').v4
const playerPlaceholder = require('../../app/contexts/playerPlaceholder.json')

module.exports = {}

let playerState = {} // all player data, indexed by uuid
let playerConnection = {}
let idGenerator = { nameId: 1, listId: 1 } // to make name unique too

const createPlayer = (clientParams) => {
  console.log('state length:', Object.keys(playerState).length)
  console.log('creating', clientParams.name)
  const nameExists = Object.values(playerState).find((pl) => pl.name === clientParams.name)
  const newName = nameExists
    ? String(clientParams.name) + ' ' + idGenerator.nameId++
    : clientParams.name

  const newPlayer = {
    ...playerPlaceholder,
    name: newName,
    order: idGenerator.listId++,
    avatarName: clientParams.avatarName,
    avatarTheme: clientParams.avatarTheme,
    isInactive: false,
    isDesigner: Object.keys(playerState).length === 0
  }

  const playerId = uuid()
  playerState[playerId] = newPlayer
  console.log('state length:', Object.keys(playerState).length)
  return { uuid: playerId, name: newName }
}

const connectPlayer = (name, uuid, ctx) => {
  try {
    const playerExists = !!playerState[uuid]
    const playerIsAuthentic = playerExists && !!(playerState[uuid].name === name)
    if (playerIsAuthentic && playerExists) {
      playerConnection[name] = ctx
      return true
    } else {
      ctx.status = 403
      ctx.message = 'Client not authentic. Disconnecting.'
      ctx.res.end()
      return false
    }
  } catch (e) {
    throw new Error(e)
  }
}

const removePlayer = (uuid, name) => {
  let playerConneEntries = Object.entries(playerConnection)
  let playerStateEntries = Object.entries(playerState)
  const unwantedKey = playerConneEntries.find(([key]) => key === name) || ''
  const unwantedState = playerStateEntries.find(([key]) => key === uuid)
  let unwantedName = ''

  if (unwantedState) {
    unwantedName = unwantedState[1].name

    playerStateEntries = playerStateEntries.filter(([id, obj]) => obj.name !== unwantedName)
    playerState = Object.fromEntries(playerStateEntries)
  }

  if (unwantedKey) {
    unwantedName = unwantedKey[0]

    const remantPlayerState = playerStateEntries.find(
      ([id, player]) => player.name === unwantedName
    )
    if (!uuid && remantPlayerState) {
      remantPlayerState[1].isInactive = true
    }

    playerConneEntries = playerConneEntries.filter(([name]) => name !== unwantedName)

    playerConnection = Object.fromEntries(playerConneEntries)
  }

  return unwantedName
}

const updatePlayerGrid = ({ playerUuid, gridId, gridProgress }) => {
  try {
    playerState[playerUuid] = {
      ...playerState[playerUuid],
      rounds: [...playerState[playerUuid].rounds],
      grid: gridId,
      pingGrid: gridProgress ? Date.now() : null,
      gridProgress: gridProgress
    }
    return true
  } catch (e) {
    throw new Error(e)
  }
}
const updatePlayerScores = ({ playerUuid, index, points, grid }) => {
  try {
    const existing = playerState[playerUuid].rounds.find((round) => round.index === index) || {}
    const newScore = {
      index: existing.index || index,
      points,
      grid,
      wasDesigner: playerState[playerUuid].isDesigner
    }
    const updatedRounds = [...playerState[playerUuid].rounds]
    updatedRounds[existing.index || index] = newScore

    playerState[playerUuid] = {
      ...playerState[playerUuid],
      pingRounds: Date.now(),
      rounds: updatedRounds
    }

    return true
  } catch (e) {
    throw new Error(e)
  }
}
const updatePreparationGrid = ({ playerUuid, gridId }) => {
  try {
    playerState[playerUuid] = {
      ...playerState[playerUuid],
      rounds: [...playerState[playerUuid].rounds],
      preparationGrid: gridId
    }
    return true
  } catch (e) {
    throw new Error(e)
  }
}
const setDesignerStatus = ({ playerUuid, isNextDesigner }) => {
  try {
    playerState[playerUuid] = {
      ...playerState[playerUuid],
      rounds: [...playerState[playerUuid].rounds],
      preparationGrid: null,
      isDesigner: isNextDesigner // playerState[playerUuid].preparationGrid ? true : false
    }
    return true
  } catch (e) {
    throw new Error(e)
  }
}
const setActive = ({ playerUuid }) => {
  try {
    playerState[playerUuid] = {
      ...playerState[playerUuid],
      rounds: [...playerState[playerUuid].rounds],
      isInactive: false
    }
    return true
  } catch (e) {
    throw new Error(e)
  }
}

const resolvePlayerUuid = ({ name }) => {
  const player = Object.entries(playerState).find(([, obj]) => obj.name === name)
  const playerUuid = player && player[0]
  return playerUuid
}

const getCurrentRound = (playerUuid) => playerState[playerUuid].rounds.length - 1
const getName = (playerUuid) => playerState[playerUuid].name

const pingChat = (playerUuid, timestamp) => {
  try {
    playerState[playerUuid] = {
      ...playerState[playerUuid],
      rounds: [...playerState[playerUuid].rounds],
      pingChat: timestamp
    }
    return true
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  getPlayerState: () => Object.entries(playerState),
  getPlayerObjects: () => Object.values(playerState),
  getPlayerConnection: () => playerConnection,
  connectPlayer,
  createPlayer,
  removePlayer,
  updatePlayerGrid,
  updatePlayerScores,
  updatePreparationGrid,
  setDesignerStatus,
  setActive,
  resolvePlayerUuid,
  getCurrentRound,
  getName,
  pingChat
}
