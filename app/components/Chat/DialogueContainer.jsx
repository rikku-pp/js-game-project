import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useFetch } from 'use-http'
import classnames from 'classnames'

import { apiUrl, apiOptions, createQueryString } from '../../api-utils'
import { ChatMessageMaxLength } from '../../constants.json'
import { PlayerContext } from '../../contexts'
import { GridDialogue } from './GridDialogue'
import { makeBackgroundStyles, Avatar } from '../Avatar'
import './DialogueContainer.css'

export const DialogueContainer = ({ counterpartName, roundIndex, hidden, handleClose }) => {
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const { myPlayer, myTokens, players } = useContext(PlayerContext)
  const { get: getGrid, data: ownGrid = {} } = useFetch(`${apiUrl}/grid`, apiOptions)
  const { get: getOtherGrid, data: otherGrid = {} } = useFetch(`${apiUrl}/grid`, apiOptions)
  const { get: getMessages, post: postMessage, response } = useFetch(
    `${apiUrl}/message`,
    apiOptions
  )
  const [messages, setMessages] = useState([])
  const { uuid: playerUuid = '' } = myTokens
  const { pingChat } = myPlayer
  const otherPlayer = players.find((player) => player.name === counterpartName)

  useEffect(() => {
    fetchGrid(myPlayer, getGrid)
    fetchGrid(otherPlayer, getOtherGrid)
  }, [playerUuid, otherPlayer, myPlayer, roundIndex]) // eslint-disable-line

  useEffect(() => {
    fetchMessages()
  }, [playerUuid, counterpartName, roundIndex, pingChat]) // eslint-disable-line

  async function fetchMessages() {
    if (playerUuid && counterpartName) {
      const roundSelect = typeof roundIndex !== 'undefined' && { roundIndex }
      const messagesData = await getMessages(
        createQueryString({ playerUuid, counterpartName, ...roundSelect })
      )
      if (response.ok && Array.isArray(messagesData)) {
        setMessages(messagesData)
        scrollRef.current.scrollTo(0, messagesData.length * 50)
      } else {
        setMessages([])
      }
    }
  }

  async function fetchGrid(playerObj, get) {
    if (typeof roundIndex === 'number' && playerObj) {
      const round = playerObj.rounds.find((round) => round.index === roundIndex)
      const gridId = round && round.grid
      get(createQueryString({ playerUuid, gridId }))
    }
  }

  const onExitClicked = useCallback(
    (event) => {
      event.preventDefault()
      handleClose({ type: 'Chat Close' })
    },
    [handleClose]
  )

  const onSendClicked = async (event) => {
    event.preventDefault()
    if (inputRef.current.value) {
      const body = { playerUuid, counterpartName, text: inputRef.current.value }
      if (typeof roundIndex === 'number') {
        body.roundIndex = roundIndex
      }
      await postMessage(body)
      if (response.ok) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <div className={classnames('dialogue-container', hidden ? 'hidden' : undefined)}>
      <div className="chat-container-top">
        <div className="chat-container-avatar">
          <Avatar
            size={40}
            dataUrl={
              otherPlayer &&
              window.localStorage.getItem('PatternsII-avatar-' + otherPlayer.avatarName)
            }
            bgThemeColors={otherPlayer && otherPlayer.avatarTheme.colors}
          />
        </div>
        <div className="chat-container-close" onClick={onExitClicked}>
          X
        </div>
      </div>
      <div className="chat-container">
        <div className="chat-container-scroll" ref={scrollRef}>
          {Array.isArray(messages) &&
            messages.map((message, index) => {
              const time = new Date(message.timestamp)
              return (
                <div className="chat-message" key={message.timestamp || index}>
                  <div
                    className="chat-message-highlight"
                    style={
                      otherPlayer && {
                        backgroundColor:
                          otherPlayer.name === message.from
                            ? otherPlayer.avatarTheme.colors[1]
                            : 'grey'
                      }
                    }
                  />
                  <div className="chat-message-side">
                    <div className="chat-message-timestamp">
                      {`${(time.getHours() > 9 ? '' : '0') + time.getHours()}:${
                        (time.getMinutes() > 9 ? '' : '0') + time.getMinutes()
                      }`}
                    </div>
                    <div className="chat-message-sender">
                      {otherPlayer && otherPlayer.name === message.from ? otherPlayer.name : 'You'}
                    </div>
                  </div>
                  <div>{message.text}</div>
                </div>
              )
            })}
          {typeof roundIndex !== 'undefined' ? (
            <div className="chat-delimiter-info">{`Conversation — round ${roundIndex + 1}`}</div>
          ) : null}
          <form className="chat-input">
            <input
              type="text"
              ref={inputRef}
              className="chat-text-input"
              maxLength={ChatMessageMaxLength}
            />
            <button onClick={onSendClicked} className="chat-text-submit">
              Send
            </button>
          </form>
        </div>
      </div>
      {typeof roundIndex === 'number' ? (
        <GridDialogue
          ownGrid={ownGrid}
          ownStyles={makeBackgroundStyles(
            myPlayer && myPlayer.avatarTheme && myPlayer.avatarTheme.colors
          )}
          wasDesigner={myPlayer && myPlayer.rounds[roundIndex].wasDesigner}
          otherGrid={otherGrid}
          otherStyles={makeBackgroundStyles(
            otherPlayer && otherPlayer.avatarTheme && otherPlayer.avatarTheme.colors
          )}
          otherPlayer={otherPlayer || {}}
          otherWasDesigner={otherPlayer && otherPlayer.rounds[roundIndex].wasDesigner}
        />
      ) : null}
    </div>
  )
}
