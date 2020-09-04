import React, { useRef, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import useFetch from 'use-http'
import { useSpring, animated } from 'react-spring'
import { apiUrl, apiOptions } from '../../api-utils'
import { PlayerNameMaxLength } from '../../constants.json'
import { PlayerContext } from '../../contexts'

import './PlayerReg.css'
import { Avatar } from '../Avatar'
import { Loader } from '../Loader'

const PlayerReg = ({ suggestions = [{ name: ' ' }] }) => {
  const { createPlayerEvents } = useContext(PlayerContext)
  const [avatarIndex, setAvatarIndex] = useState(0)

  const inputName = useRef(null)
  const [request, response] = useFetch(`${apiUrl}/players`, apiOptions)

  const { name, dataUrl, bgTheme } = suggestions[avatarIndex]
  const nameAddons = bgTheme.name
    .split('_')
    .filter((n) => n !== 'day')
    .map((n) => n[0].toUpperCase() + n.slice(1))

  const placeholderName = `Anonymous ${nameAddons.reverse().join(' ')} ${
    name[0].toUpperCase() + name.slice(1)
  }`

  const onAvatarClick = () => {
    setAvatarIndex((avatarIndex + 1) % suggestions.length)
  }

  const onInputFocus = () => {
    inputName.current.placeholder = ''
  }

  const onButtonClick = async (event) => {
    event.preventDefault()

    try {
      const playerInput = {
        name: inputName.current.value || placeholderName,
        avatarName: suggestions[avatarIndex].name || '',
        avatarTheme: suggestions[avatarIndex].bgTheme || {
          name: '',
          dataUrl: '',
          colors: ['', '', '']
        }
      }

      const playerTokens = await request.post(playerInput)

      if (response.status === 201) {
        await createPlayerEvents(playerTokens)
      }
    } catch (err) {
      console.log('New player could not be registered. ', err)
    }
  }

  const alpha = useSpring({
    opacity: request.loading || request.error ? 0.3 : 1
  })

  return (
    <>
      {(request.loading || request.error) && <Loader status={'LOADING'} />}
      <animated.div
        className="reg-container"
        style={Object.assign({}, alpha, {
          pointerEvents: request.loading || request.error ? 'none' : 'auto'
        })}
      >
        <form className="form-container">
          <label>
            <span>Avatar</span>
            <Avatar
              dataUrl={dataUrl}
              bgThemeColors={bgTheme.colors}
              onClick={onAvatarClick}
            ></Avatar>
            <span
              role="img"
              aria-label="select-random"
              className={classnames('select-random', bgTheme.colors[2])}
            >
              &gt;&gt;
            </span>
          </label>
          <label>
            <span>Player name</span>
            <textarea
              onFocus={onInputFocus}
              placeholder={placeholderName}
              ref={inputName}
              className="text-input"
              wrap="hard"
              maxLength={PlayerNameMaxLength}
            />
            <svg
              className="text-input-svg"
              width="300"
              height="150"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke="null"
                fill="#cccccc"
                d="m280.803494,46.467942c21.746549,22.936238 21.891045,50.790263 0.361238,69.655218c-21.602054,18.824645 -65.022905,28.66022 -116.824486,31.360972c-51.801581,2.741062 -112.128388,-1.652699 -140.955209,-22.815309c-28.899069,-21.202919 -26.442648,-59.255307 3.756879,-84.851987c30.127279,-25.63699 87.85317,-38.898892 138.354293,-36.520618c50.501123,2.337964 93.632983,20.275796 115.307285,43.171724z"
              />
            </svg>
          </label>
        </form>
        <div onClick={onButtonClick}>
          <button className="create-button">Create</button>
        </div>
      </animated.div>
    </>
  )
}

PlayerReg.propTypes = {
  suggestions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      dataUrl: PropTypes.string
    })
  )
}

export { PlayerReg }
