import React, { createContext, useState, useEffect } from 'react'

import { apiUrl, apiOptions, createQueryString } from '../api-utils'
import playerPlaceholder from './playerPlaceholder.json'
import useFetch from 'use-http'
import { useSSE } from '../hooks'

const initialData = {
  name: window.localStorage.getItem(`PatternsII-player-name`),
  uuid: window.localStorage.getItem(`PatternsII-player-uuid`)
}

export const PlayerContext = createContext({
  players: [],
  myTokens: {},
  myPlayer: {},
  exitPlayer: () => {},
  putPlayer: async () => {}
})

const getSseUrl = (name, uuid) => `${apiUrl}/events?name=${name}&uuid=${uuid}`

export const PlayerContextProvider = ({ children }) => {
  const [players, setPlayers] = useState([])
  const [myTokens, setMyTokens] = useState({})
  const { data: session } = useFetch(
    `${apiUrl}/players${createQueryString(initialData)}`,
    apiOptions,
    []
  )

  const [request, response] = useFetch(apiUrl, apiOptions)
  const { openEvents, closeEvents } = useSSE('', setPlayers)

  const putPlayer = async (action, body) => {
    request.put(`/players${createQueryString(Object.assign({ action }, myTokens))}`, body)
  }

  useEffect(() => {
    if (session) {
      if (Array.isArray(session)) {
        setPlayers(session)
      } else if (session.message === 'RESTORABLE') {
        const existingPlayer = session.data.find((pl) => pl.name === initialData.name)
        if (existingPlayer) {
          request.patch(
            `/players${createQueryString(
              Object.assign({ action: 'restore-session' }, initialData)
            )}`
          )
          setMyTokens(initialData)
          openEvents(getSseUrl(initialData.name, initialData.uuid), () =>
            console.log('Resume streaming for ', initialData.name)
          )
        }
        setPlayers(session.data)
      }
    }
    // eslint-disable-next-line
  }, [session, request])

  const createPlayerEvents = async (player) => {
    try {
      const { name, uuid } = player
      const newPlayer = { ...playerPlaceholder, name }
      setPlayers([...players, newPlayer])
      setMyTokens({ name, uuid })
      window.localStorage.setItem(`PatternsII-player-name`, name)
      window.localStorage.setItem(`PatternsII-player-uuid`, uuid)
      await new Promise((resolve, reject) => openEvents(getSseUrl(name, uuid), resolve, reject))
      console.log('Start streaming for ', name)
      return
    } catch (error) {
      console.warn('Failed to initialize SSE for ', player)
      throw new Error(error)
    }
  }

  const exitPlayer = async (endGame) => {
    try {
      const { name } = myTokens

      setMyTokens({})
      setPlayers(players.filter((player) => player.name !== name))
      console.log('☑ exited player session')

      closeEvents()
      console.log('☑ closed sse session')

      await request.del(`/players${createQueryString({ ...myTokens, ...endGame })}`)

      if (response.ok) {
        console.log(endGame ? '☑ removed all players from server' : '☑ removed player from server')
        setPlayers([])
        setMyTokens([])
      }
    } catch (error) {
      console.warn('🔴 Failed exit with error: ', error)
    }
  }

  return (
    <PlayerContext.Provider
      value={{
        players,
        myTokens,
        myPlayer: players.find((player) => player.name === myTokens.name) || {},
        createPlayerEvents,
        putPlayer,
        exitPlayer
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}
