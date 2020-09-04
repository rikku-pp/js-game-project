import { SYMBOLS } from './Grid/MarkButton'

let messages = {
  DESIGNING: 'Design your pattern!',
  DESIGNER_AWAITING_PLAYER_COUNT: 'Min 3 players are required',
  DESIGNER_CALL_TO_START: 'You may start the game ✔',
  DESIGNER_AWAITING_PLAYER_SOLUTIONS: 'Awaiting player solutions',
  PLAYING: 'Request clues until you can guess the pattern!',
  PLAYING_CALL_TO_SUBMIT: 'Pattern is ready for examination 📤',
  PLAYER_AWAITING_DESIGNER: 'Awaiting designer to finish pattern',
  PLAYER_AWAITING_PLAYER_COUNT: 'Min 3 active players are required',
  PLAYER_AWAITING_CALL_TO_START: 'Awaiting designer to initiate the game',
  PLAYER_AWAITING_PLAYER_SOLUTIONS: 'Done. Awaiting other players solutions',
  PLAYER_CALL_TO_DESIGN_NEXT: 'Done. You are next designer',
  PLAYER_DESIGNING_WHILE_WAITING: 'Go ahead and design next pattern',
  DESIGNER_CALL_TO_RELAY: 'Round completed 🔁'
}

export const getStatusMessages = () => messages

// state logics (aiming for finite states, but hard for complex async logics)
export const resolveGameState = (myPlayer, players, localGrid, myGrid) => {
  const activePlayers = players.filter((player) => player.isInactive === false)
  const sortedActivePlayers = activePlayers.sort((a, b) => a.order - b.order)
  const activeNonDesigners = players.filter((player) => !player.isInactive && !player.isDesigner)
  const collectiveGridProgress = activeNonDesigners.reduce(
    (progress, player) => (progress += player.gridProgress),
    0
  )

  const designer = players.find((player) => player.isDesigner === true) || {}
  const { isDesigner } = myPlayer
  const isPlayer = !isDesigner

  const nextDesigner =
    sortedActivePlayers[(sortedActivePlayers.indexOf(designer) + 1) % sortedActivePlayers.length]

  const questionMarks = localGrid.data.filter(([char]) => char === SYMBOLS.mark)

  const DESIGNING = isDesigner && myPlayer.gridProgress < 36
  const DESIGNER_AWAITING_PLAYER_COUNT = isDesigner && !!myPlayer.grid && players.length < 3
  const DESIGNER_AWAITING_PLAYER_SOLUTIONS =
    isDesigner &&
    activePlayers.length >= 3 &&
    designer.gridProgress === 36 &&
    !activeNonDesigners.find((player) => player.gridProgress === null) &&
    collectiveGridProgress / activeNonDesigners.length < 36

  const DESIGNER_CALL_TO_START =
    isDesigner &&
    activePlayers.length >= 3 &&
    activePlayers.filter((player) => player.gridProgress === 36).length === 1 &&
    myPlayer.gridProgress === 36 &&
    !!activeNonDesigners.find((player) => player.gridProgress === null)
  const DESIGNER_CALL_TO_RELAY =
    isDesigner && !activePlayers.find((player) => player.gridProgress !== 36) && players.length >= 3

  const PLAYING =
    isPlayer &&
    myPlayer.gridProgress !== null &&
    myPlayer.gridProgress !== 36 &&
    localGrid.progress !== 36
  const PLAYING_CALL_TO_SUBMIT =
    isPlayer &&
    !myGrid.isSubmitted &&
    !localGrid.isSubmitted &&
    localGrid.progress === 36 &&
    questionMarks.length === 0
  const PLAYER_AWAITING_DESIGNER = isPlayer && designer && designer.gridProgress < 36
  const PLAYER_AWAITING_PLAYER_COUNT =
    isPlayer && designer && designer.gridProgress === 36 && players.length < 3
  const PLAYER_AWAITING_CALL_TO_START =
    isPlayer &&
    myPlayer.gridProgress === null &&
    designer &&
    designer.gridProgress === 36 &&
    activePlayers.length >= 3
  const PLAYER_AWAITING_PLAYER_SOLUTIONS =
    isPlayer &&
    myGrid.isSubmitted &&
    collectiveGridProgress / activePlayers.length < 36 &&
    (nextDesigner.name !== myPlayer.name || !!myPlayer.preparationGrid)
  const PLAYER_CALL_TO_DESIGN_NEXT =
    activePlayers.length > 1 &&
    myGrid.isSubmitted &&
    myPlayer.gridProgress === 36 &&
    nextDesigner.name === myPlayer.name &&
    !localGrid.hidden &&
    !myPlayer.preparationGrid
  const PLAYER_DESIGNING_WHILE_WAITING =
    activePlayers.length > 1 &&
    myPlayer.gridProgress === 36 &&
    nextDesigner.name === myPlayer.name &&
    !!localGrid.hidden &&
    !myPlayer.preparationGrid

  return {
    DESIGNING,
    DESIGNER_AWAITING_PLAYER_COUNT,
    DESIGNER_CALL_TO_START,
    DESIGNER_AWAITING_PLAYER_SOLUTIONS,
    PLAYING,
    PLAYING_CALL_TO_SUBMIT,
    PLAYER_AWAITING_DESIGNER,
    PLAYER_AWAITING_PLAYER_COUNT,
    PLAYER_AWAITING_CALL_TO_START,
    PLAYER_AWAITING_PLAYER_SOLUTIONS,
    DESIGNER_CALL_TO_RELAY,
    PLAYER_CALL_TO_DESIGN_NEXT,
    PLAYER_DESIGNING_WHILE_WAITING
  }
}
