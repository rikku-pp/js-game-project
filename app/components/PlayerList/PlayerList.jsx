import React, { useContext, useCallback } from 'react'

import { PlayerContext } from '../../contexts/Players'
import { PlayerItem } from './PlayerItem'
import { use360Layout } from './hooks'
import './PlayerList.css'

import { animated } from 'react-spring'

export const PlayerList = ({
  handleEvent,
  spyOnGrid,
  setSpyOnGrid,
  chatWithPlayer,
  setChatWithPlayer
}) => {
  const { players } = useContext(PlayerContext)
  const playerList = use360Layout(players.length)

  const toggleOtherPlayerGrid = useCallback(
    (name) => {
      if (name === spyOnGrid.name) {
        handleEvent({ type: 'Spy On Player Close' })
        return setSpyOnGrid({ name: '' })
      }
      handleEvent({ type: 'Spy On Player' })
      setSpyOnGrid({ name })
    },
    [spyOnGrid, setSpyOnGrid, handleEvent]
  )

  const toggleChatWithPlayer = useCallback(
    ({ name, roundIndex }) => {
      if (name === chatWithPlayer.name) {
        handleEvent({ type: 'Chat Close' })
        return setChatWithPlayer({ name: '' })
      }
      handleEvent({ type: 'Chat Open' })
      setChatWithPlayer({ name, roundIndex })
    },
    [chatWithPlayer, setChatWithPlayer, handleEvent]
  )

  return (
    <>
      {playerList.map(({ item, props: { transform }, key }) => (
        <animated.div key={key} className="player-container" style={{ transform }}>
          <PlayerItem
            index={item.index}
            angle={item.angle}
            currentSpy={spyOnGrid}
            toggleSpy={toggleOtherPlayerGrid}
            currentChat={chatWithPlayer}
            toggleChat={toggleChatWithPlayer}
          />
        </animated.div>
      ))}
    </>
  )
}
