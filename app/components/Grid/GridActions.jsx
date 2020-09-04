import React, { useContext, useCallback } from 'react'
import classnames from 'classnames'
import { PlayerContext, GridContext } from '../../contexts'
import { SYMBOLS } from './MarkButton'
import './GridActions.css'

import { ActionButton } from './ActionButtons.jsx'
import ActionButtonProps from './ActionButtons.json'

export const GridActions = ({ clientGameState, gridProgress, handleAction }) => {
  const { myPlayer, players } = useContext(PlayerContext)
  const { localGrid } = useContext(GridContext)
  const isFirstPlayer = myPlayer.name === players[0].name

  const onClick = useCallback(
    (event) => {
      event.preventDefault()
      handleAction({ type: String(event.target.textContent) })
    },
    [handleAction]
  )

  const activePlayers = players.filter((player) => player.isInactive === false)
  const questionMarks = localGrid.data.filter(([char]) => char === SYMBOLS.mark)

  const startDisabled =
    !myPlayer.grid || activePlayers.length < 3 || clientGameState.DESIGNER_AWAITING_PLAYER_SOLUTIONS
  const finalizeDisabled = gridProgress < 36
  const clueDisabled = questionMarks.length === 0
  const examineDisabled = !clientGameState.PLAYING_CALL_TO_SUBMIT
  const proceedDisabled = activePlayers.find((player) => player.gridProgress < 36)

  const isDesignProcess = clientGameState.DESIGNING && !clientGameState.PLAYING_CALL_TO_SUBMIT
  const isDesignReady =
    clientGameState.DESIGNER_CALL_TO_START || clientGameState.DESIGNER_AWAITING_PLAYER_COUNT
  const isGuessingProcess = !myPlayer.isDesigner && clientGameState.PLAYING
  const isGuessingReady = clientGameState.PLAYING_CALL_TO_SUBMIT
  const isRoundComplete = clientGameState.DESIGNER_CALL_TO_RELAY
  const isNextDesigner = clientGameState.PLAYER_CALL_TO_DESIGN_NEXT
  const isNextDesignProcess = clientGameState.PLAYER_DESIGNING_WHILE_WAITING

  let nextProps, secondActionProps
  if (isDesignProcess) nextProps = { type: 'FinalizeButton', disabled: finalizeDisabled }
  else if (isDesignReady) nextProps = { type: 'StartButton', disabled: startDisabled }
  else if (isGuessingProcess) nextProps = { type: 'ClueButton', disabled: clueDisabled }
  else if (isGuessingReady) nextProps = { type: 'ExamineButton', disabled: examineDisabled }
  else if (isRoundComplete) {
    nextProps = {
      type: 'ProceedButton',
      disabled: proceedDisabled,
      confirm: players.find((player) => player.isInactive)
        ? 'Proceeding to the next round will remove the currently inactive player(s)🧹 Are you sure?'
        : undefined,
      tip: gridProgress === 0 ? 'Hang on while new designer is being assigned' : undefined
    }
  } else nextProps = { type: 'ScoreButton', disabled: false }

  if (isNextDesigner) secondActionProps = { type: 'NextButton', disabled: false }
  if (isNextDesignProcess)
    secondActionProps = {
      type: 'FinalizeButton',
      disabled: finalizeDisabled
    }

  return (
    <div className="grid-action-container">
      {(isNextDesigner || isNextDesignProcess) && (
        <ActionButton onClick={onClick} {...secondActionProps} />
      )}
      <ActionButton onClick={onClick} {...nextProps} />
      <div className={classnames('divider', 'button-container')}>●</div>
      <ActionButton
        type={isFirstPlayer ? 'EndButton' : 'LeaveButton'}
        onClick={onClick}
        {...ActionButtonProps[isFirstPlayer ? 'EndButton' : 'LeaveButton']}
        confirm={
          '⚠ Are you sure? ' +
          (isFirstPlayer
            ? 'This will erase all players and scores 🗑'
            : '(You may re-join when a new game is started 💡)')
        }
      />
    </div>
  )
}
