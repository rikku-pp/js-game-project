import React, { useContext, useEffect, useState } from 'react'
import { PlayerContext, GridContext } from '../contexts'
import { PlayerList } from './PlayerList'
import { GridContainer, GridActions, MarkButtonContainer, StatusMessage, GridSpy } from './Grid'
import { DialogueContainer } from './Chat'
import { ScoreBoard } from './ScoreBoard'
import { useGridStyles } from './Grid/hooks'
import { useSpring, animated } from 'react-spring'
import { resolveGameState, getStatusMessages } from './resolveGameState'
import classnames from 'classnames'
import './PatternsII.css'

export const PatternsII = () => {
  const { players, myPlayer, putPlayer, exitPlayer } = useContext(PlayerContext)
  const { localGrid, setLocalGrid, myGrid, createEmptyGrid } = useContext(GridContext)
  const { containerStyles, gridStyles } = useGridStyles()
  const [cursor, setCursor] = useState('')
  const [actionClickEvent, setActionClickEvent] = useState('')
  const [lastEvent, setLastEvent] = useState(null)
  const [clientGridProgress, setClientGridProgress] = useState(null)
  const [clientGameState, setClientGameState] = useState({})
  const [gameFade, setGameFade] = useSpring(() => ({ opacity: 1 }))
  const [displayScoreBoard, setDisplayScoreBoard] = useState(false)
  const [scoreboardNav, setScoreboardNav] = useState(false)
  const [spyOnGrid, setSpyOnGrid] = useState({ name: '' })
  const [chatWithPlayer, setChatWithPlayer] = useState({ name: '' })

  useEffect(
    function handleAction() {
      if (actionClickEvent !== lastEvent) {
        setLastEvent(actionClickEvent)
        setScoreboardNav(!!actionClickEvent.scoreboardNav)
        switch (actionClickEvent.type) {
          case 'Start Game':
            putPlayer('init-grid-round')
            break
          case 'Proceed Game':
            putPlayer('next-round')
            setClientGridProgress(36)
            break
          case 'Examine Pattern':
            putPlayer('scores', localGrid)
            break
          case 'Score Board':
            setGameFade({ opacity: 0, visibility: 'hidden' })
            setDisplayScoreBoard(true)
            setSpyOnGrid({ name: '' })
            setChatWithPlayer({ name: '' })
            break
          case 'Score Board Close':
            setDisplayScoreBoard(false)
            setScoreboardNav(false)
            setGameFade({ opacity: 1, visibility: 'visible' })
            break
          case 'Spy On Player':
            setGameFade({ opacity: 0 })
            setDisplayScoreBoard(false)
            setChatWithPlayer({ name: '' })
            break
          case 'Spy On Player Close':
            !scoreboardNav && setGameFade({ opacity: 1, visibility: 'visible' })
            scoreboardNav && setDisplayScoreBoard(true)
            setSpyOnGrid({ name: '' })
            break
          case 'Chat Open':
            setGameFade({ opacity: 0, visibility: 'hidden' })
            setSpyOnGrid({ name: '' })
            setDisplayScoreBoard(false)
            break
          case 'Chat Close':
            !scoreboardNav && setGameFade({ opacity: 1, visibility: 'visible' })
            scoreboardNav && setDisplayScoreBoard(true)
            setChatWithPlayer({ name: '' })
            break
          case 'Leave Game':
            exitPlayer()
            setLocalGrid(createEmptyGrid())
            break
          case 'End Game':
            exitPlayer({ endGame: true })
            setLocalGrid(createEmptyGrid())
            break
          case 'Design Next':
            setClientGridProgress(0)
            break
          default:
            setGameFade({ opacity: 1 })
            break
        }
      }
    },
    [
      actionClickEvent,
      putPlayer,
      setGameFade,
      exitPlayer,
      lastEvent,
      gameFade,
      localGrid,
      createEmptyGrid,
      setLocalGrid,
      scoreboardNav
    ]
  )

  useEffect(() => {
    setClientGameState(resolveGameState(myPlayer, players, localGrid, myGrid))
  }, [myPlayer, players, localGrid, myGrid])

  return (
    <>
      <animated.div
        style={Object.assign(containerStyles, gameFade)}
        className={classnames(
          'patterns-container',
          displayScoreBoard || spyOnGrid.name || chatWithPlayer.name ? undefined : 'interactive'
        )}
      >
        <MarkButtonContainer cursor={cursor} setCursor={setCursor} />
        <GridContainer
          clientGameState={clientGameState}
          onProgress={setClientGridProgress}
          actionEvent={actionClickEvent}
          styles={gridStyles}
          cursor={cursor}
        >
          <StatusMessage>
            {Object.entries(getStatusMessages())
              .filter(([key]) => !!clientGameState[key])
              .map((mess) => mess[1])
              .join(' ')}
          </StatusMessage>
        </GridContainer>

        <GridActions
          clientGameState={clientGameState}
          gridProgress={clientGridProgress}
          handleAction={setActionClickEvent}
        />
      </animated.div>

      <PlayerList
        handleEvent={setActionClickEvent}
        spyOnGrid={spyOnGrid}
        setSpyOnGrid={setSpyOnGrid}
        chatWithPlayer={chatWithPlayer}
        setChatWithPlayer={setChatWithPlayer}
      />

      <div style={containerStyles} className={'patterns-container'} id="grid-spy-container">
        <GridSpy
          name={spyOnGrid.name}
          gridId={spyOnGrid.gridId}
          gridStyles={gridStyles}
          hidden={!spyOnGrid.name}
          handleClose={setActionClickEvent}
        >
          <StatusMessage>
            {spyOnGrid.name}&nbsp;&nbsp;
            {players.find(
              (player) =>
                player.name === spyOnGrid.name &&
                player.rounds.find((round) => round.grid === spyOnGrid.gridId && round.wasDesigner)
            )
              ? '(Designer)'
              : ''}
          </StatusMessage>
        </GridSpy>
      </div>

      <div
        style={{ margin: 0.2 * Number(containerStyles.margin) }}
        className={classnames('bring-to-front', 'click-transparent')}
      >
        <DialogueContainer
          counterpartName={chatWithPlayer.name}
          roundIndex={chatWithPlayer.roundIndex}
          hidden={!chatWithPlayer.name}
          handleClose={setActionClickEvent}
        />
      </div>

      <ScoreBoard
        hidden={!displayScoreBoard}
        handleAction={setActionClickEvent}
        setSpyOnGrid={setSpyOnGrid}
        setChatWithPlayer={setChatWithPlayer}
      />
    </>
  )
}
