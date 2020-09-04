import React, { useContext, useState, useCallback, useEffect } from 'react'
import classnames from 'classnames'
import { PlayerContext, GridContext } from '../../contexts'
import { useAvatar } from '../../hooks'
import { useResponsiveSizing } from './hooks'
import { PlayerSubItem, PlayerName, PlayerAvatar } from './'
import './PlayerItem.css'
import { AvatarSizes, Breakpoints } from '../../constants.json'

export const getScreenSize = (width) => {
  if (width < Breakpoints.MEDIUM) {
    return 'SMALL'
  }
  if (width < Breakpoints.LARGE) {
    return 'MEDIUM'
  } else if (width >= Breakpoints.LARGE) {
    return 'LARGE'
  }
}

export const PlayerItem = ({ index, angle, currentSpy, toggleSpy, currentChat, toggleChat }) => {
  const { players, myPlayer } = useContext(PlayerContext)
  const { grid } = useContext(GridContext)
  const sortedPlayers = players.sort((a, b) => a.order - b.order)
  const player = sortedPlayers[index] || {}

  const dataUrl = useAvatar(player.avatarName)
  const [size, align, transform] = useResponsiveSizing(
    AvatarSizes,
    Breakpoints,
    angle,
    '--avatar-size'
  )

  const [lastChat, setLastChat] = useState(
    players.reduce((acc, next) => ({ ...acc, [next.name]: next.pingChat }), {})
  )
  useEffect(() => {
    if (currentChat.name === player.name) {
      setLastChat({
        ...lastChat,
        [player.name]: player.pingChat
      })
    }
  }, [currentChat, player]) // eslint-disable-line

  const [lastSpy, setLastSpy] = useState(
    players.reduce((acc, next) => ({ ...acc, [next.name]: next.pingGrid }), {})
  )
  useEffect(() => {
    if (currentSpy.name === player.name) {
      setLastSpy({
        ...lastSpy,
        [player.name]: player.pingGrid
      })
    }
  }, [currentSpy, player]) // eslint-disable-line

  const [showSubItems, setShowSubItems] = useState(null)
  const toggleSubItems = useCallback(() => {
    window.clearTimeout(showSubItems)
    if (!showSubItems) {
      setShowSubItems(
        window.setTimeout(() => {
          setShowSubItems(null)
        }, 4200)
      )
    } else {
      setShowSubItems(null)
    }
  }, [showSubItems])

  const avatarTheme = player.avatarTheme || {}
  const bgThemeColors = avatarTheme.colors || ['', '', 'white']
  const subItemProps = { avatarSize: size, align, angle }

  return (
    <div className={classnames('player-item-container', player.isInactive && 'inactive')}>
      <PlayerAvatar
        onClick={player.name === myPlayer.name ? undefined : toggleSubItems}
        avatarProps={{ dataUrl, bgThemeColors, size }}
        avatarStyles={{ [align]: 0, width: size, height: size, transform }}
        inactive={player.name === myPlayer.name}
      />
      <PlayerName
        name={player.name}
        isMyPlayer={player.name === myPlayer.name}
        align={align}
        avatarSize={size}
        isDesigner={player.isDesigner}
      />
      {player.name !== myPlayer.name && (
        <div className="player-sub-item-container">
          <PlayerSubItem
            {...subItemProps}
            xor={1}
            display={
              (lastSpy &&
                player.pingGrid &&
                (myPlayer.isDesigner || (grid && grid.isSubmitted)) &&
                lastSpy[player.name] !== player.pingGrid &&
                player.name !== currentSpy.name) ||
              (!!showSubItems && myPlayer.isDesignergi)
            }
            selected={currentSpy.name === player.name}
            onClick={() => {
              toggleSpy(player.name)
              setLastSpy({ ...lastSpy, [player.name]: player.pingGrid })
            }}
          >
            <img alt="Pattern Icon" src="https://cdn.glitch.com/48c3bf36-f420-4677-bb7d-c1924b566f33%2Fpattern.png?v=1590534709328" />
          </PlayerSubItem>
          <PlayerSubItem
            {...subItemProps}
            xor={-1}
            display={
              (lastChat &&
                player.pingChat &&
                player.pingChat === myPlayer.pingChat &&
                lastChat[player.name] !== player.pingChat &&
                player.name !== currentChat.name) ||
              !!showSubItems
            }
            selected={currentChat.name === player.name}
            onClick={() => {
              toggleChat({ name: player.name })
              setLastChat({ ...lastChat, [player.name]: player.pingChat })
            }}
          >
            <img alt="Chat Icon" src="https://cdn.glitch.com/48c3bf36-f420-4677-bb7d-c1924b566f33%2Fspeech-balloon.png?v=1590534709289" className={align} />
          </PlayerSubItem>
        </div>
      )}
    </div>
  )
}
