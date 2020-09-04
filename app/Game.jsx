import React, { useContext } from 'react'
import { PlayerContext } from './contexts'
import { DelayMount } from './components/DelayMount'
import './Game.css'

import { Welcome } from './components/Welcome/Welcome'
import { Loader, IN_PROGRESS } from './components/Loader'
import { PatternsII } from './components/PatternsII'

export const Game = () => {
  const { myTokens, players } = useContext(PlayerContext)
  const gameInProgress = players.find(
    (player) => !player.isDesigner && player.gridProgress !== null && !player.isInactive
  )
  const myPlayerExists = players.find((player) => player.name === myTokens.name)
  const myPlayerIsInactive = players.find(
    (player) => player.name === myTokens.name && player.isInactive
  )

  if (gameInProgress && (!myPlayerExists || (myPlayerExists && myPlayerIsInactive))) {
    return <Loader status={IN_PROGRESS}>Game in progress</Loader>
  }

  if (myTokens.name) return <PatternsII />

  return (
    <DelayMount ms={100}>
      <Welcome />
    </DelayMount>
  )
}
    