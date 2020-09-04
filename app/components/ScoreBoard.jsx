import React, { useContext, useCallback } from 'react'
import classnames from 'classnames'
import { PlayerContext } from '../contexts'
import './ScoreBoard.css'

const scoreSum = (tot, next) => (tot += next.points)
const sortScores = (playerA, playerB) => {
  const scoreA = Array.isArray(playerA.rounds) && playerA.rounds.reduce(scoreSum, 0)
  const scoreB = Array.isArray(playerB.rounds) && playerB.rounds.reduce(scoreSum, 0)
  return scoreB - scoreA
}

export const ScoreBoard = ({ hidden, handleAction, setChatWithPlayer, setSpyOnGrid }) => {
  const { players, myPlayer } = useContext(PlayerContext)
  const totalsSorted = players.sort(sortScores)
  const rounds = myPlayer.rounds.map((round, index) => {
    return players.map(({ name, rounds }) => ({
      name,
      wasDesigner: rounds[index] && rounds[index].wasDesigner,
      points: rounds[index] && rounds[index].points,
      grid: rounds[index] && rounds[index].grid
    }))
  })
  const onExitClicked = useCallback(
    (event) => {
      event.preventDefault()
      handleAction({ type: 'Score Board Close' })
    },
    [handleAction]
  )

  const onChatHistoryClicked = ({ name, roundIndex }) => {
    if (name !== myPlayer.name) {
      handleAction({ type: 'Chat Open', scoreboardNav: true })
      setChatWithPlayer({ name, roundIndex })
    }
  }

  const onGridHistoryClicked = ({ name, roundIndex }) => {
    const player = players.find((player) => player.name === name)
    const round =
      (player && player.rounds && player.rounds.find((round) => round.index === roundIndex)) || {}
    const gridId = round.grid || ''
    handleAction({ type: 'Spy On Player', scoreboardNav: true })
    setSpyOnGrid({ name, gridId })
  }

  return (
    <div className={classnames('scoreboard-container', hidden ? 'hidden' : undefined)}>
      <div className="scoreboard-position">
        <div className="scoreboard-heading">
          <div className="scoreboard-exit" onClick={onExitClicked}>
            <span>{'Score Board Close'}</span>
            <img src="https://cdn.glitch.com/48c3bf36-f420-4677-bb7d-c1924b566f33%2Fpattern.png?v=1590534709328" alt="grid" />
          </div>
          <p>Totals:</p>

          <hr />
        </div>
        {totalsSorted.map((player, index) => (
          <div key={index} className="scoreboard-item">
            <span className={classnames('scoreboard-item', 'number')}>
              &nbsp;{player.rounds.reduce(scoreSum, 0)}p
            </span>
            <span>{player.name} </span>
          </div>
        ))}
        <p></p>
        <div className="scoreboard-heading">
          <p>Rounds:</p>

          <hr />
        </div>
        <div className="scoreboard-rounds-container">
          {rounds.reverse().map((round, index, arr) => {
            const scoreSortedPlayers = round.sort(sortScores)
            const roundCompleted = !arr.find((round) => !round.points)
            const roundIndex = arr.length - index - 1
            return (
              <div key={index} className={classnames('scoreboard-round')}>
                &nbsp;<u>{index === 0 ? 'Current' : `Round ${roundIndex + 1}.`}</u>
                <br />
                {scoreSortedPlayers.map((playerRound) => (
                  <div key={playerRound.name} className="scoreboard-item">
                    <div
                      className={classnames(
                        'name',
                        playerRound.name === myPlayer.name ? '' : 'chat-link'
                      )}
                      onClick={() => onChatHistoryClicked({ name: playerRound.name, roundIndex })}
                    >
                      {playerRound.name}
                      {playerRound.wasDesigner && ' 🎨'}
                    </div>
                    <div className="number">
                      {typeof playerRound.points === 'number' &&
                      !(playerRound.wasDesigner && roundCompleted)
                        ? playerRound.points
                        : '?'}
                      p
                    </div>
                    <div
                      className={classnames(
                        'icon',
                        typeof playerRound.points === 'number' || playerRound.wasDesigner
                          ? ''
                          : 'hidden'
                      )}
                      title={'Grid history - round ' + roundIndex}
                      onClick={() => onGridHistoryClicked({ name: playerRound.name, roundIndex })}
                    >
                      <img src="https://cdn.glitch.com/48c3bf36-f420-4677-bb7d-c1924b566f33%2Fpattern.png?v=1590534709328" alt="Pattern Icon" />
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
