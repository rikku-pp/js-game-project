import React, { useEffect, useContext, useCallback, useState } from 'react'
import useFetch from 'use-http'
import classnames from 'classnames'

import { apiUrl, apiOptions, createQueryString } from '../../api-utils'
import { PlayerContext } from '../../contexts'
import { Cell } from './Cell'
import { makeBackgroundStyles } from '../Avatar'
import './Grid.css'
import './GridSpy.css'

export const GridSpy = ({ name, gridId, gridStyles, hidden, handleClose, children }) => {
  const { players, myTokens } = useContext(PlayerContext)
  const { get, response } = useFetch(`${apiUrl}/grid`, apiOptions)
  const [grid, setGrid] = useState({})

  const spyTargetPlayer = players.find((obj) => obj.name === name) || {}
  const query = createQueryString({
    playerUuid: myTokens.uuid,
    gridId: gridId || spyTargetPlayer.grid
  })

  useEffect(() => {
    fetchGrid()
  }, [name, spyTargetPlayer.pingGrid]) // eslint-disable-line

  async function fetchGrid() {
    if (spyTargetPlayer) {
      const responseData = await get(query)
      if (response.ok) {
        setGrid(responseData)
      }
    }
  }

  const handleClick = useCallback(
    (event) => {
      event.preventDefault()
      handleClose({ type: 'Spy On Player Close' })
    },
    [handleClose]
  )

  const backgroundStyles =
    spyTargetPlayer.avatarTheme &&
    Array.isArray(spyTargetPlayer.avatarTheme.colors) &&
    makeBackgroundStyles(spyTargetPlayer.avatarTheme.colors)
  const btnColors =
    backgroundStyles &&
    `url('/bg.gif'), linear-gradient(45deg, ${spyTargetPlayer.avatarTheme.colors[0]},  ${spyTargetPlayer.avatarTheme.colors[1]})`

  const styles = Object.assign({}, gridStyles, { background: backgroundStyles })

  return (
    <div className={classnames('grid-spy', hidden ? 'hidden' : undefined)}>
      <div
        className={classnames('grid-spy-close')}
        onClick={handleClick}
        style={{ background: btnColors }}
      >
        X
      </div>
      {children}

      <div style={styles} className={classnames('grid', !grid ? 'blank' : undefined)}>
        <style>
          {`
          .grid > div.grid-cell {
            line-height:${gridStyles.minHeight / 6 - 4}px;
            font-size: ${gridStyles.minHeight / 14}px;
          }
        `}
        </style>
        {grid &&
          Array.isArray(grid.data) &&
          grid.data.map(([char, cluemark, failmark], i) => (
            <Cell
              key={i}
              char={char}
              index={i}
              interactionMode={cluemark ? 'clued' : grid.isSubmitted ? 'submitted' : ''}
              failModifier={failmark ? 'incorrect' : ''}
            />
          ))}
      </div>
    </div>
  )
}
