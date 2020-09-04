import React from 'react'
import PropTypes from 'prop-types'
import './Avatar.css'

export const makeBackgroundStyles = (bgThemeColors) =>
  Array.isArray(bgThemeColors) &&
  bgThemeColors.length === 3 &&
  `radial-gradient(ellipse at top, ${bgThemeColors[0]}, transparent),
radial-gradient(ellipse at bottom, ${bgThemeColors[1]}, ${bgThemeColors[2]})`

const Avatar = ({
  dataUrl = '',
  bgThemeColors = ['', '', ''],
  centerPosition = false,
  size = 60,
  onClick = () => {},
  children
}) => {
  const transform = centerPosition ? `translate(-${size / 3}px, -${size / 3}px)` : ''
  const avatarBackground = makeBackgroundStyles(bgThemeColors)
  const avatarImage = `center / cover no-repeat url("${dataUrl}")`
  const avatarFilter = `brightness(${bgThemeColors[2] === 'black' ? 0.15 : 1})`

  return (
    <div
      className="avatar"
      style={{
        background: avatarBackground,
        width: `${size + 4}px`,
        transform
      }}
      onClick={onClick}
    >
      <div
        style={{
          background: avatarImage,
          filter: avatarFilter,
          height: `${size}px`,
          width: `${size}px`,
          transform
        }}
      >
        {children}
      </div>
    </div>
  )
}

Avatar.propTypes = {
  dataUrl: PropTypes.string,
  backgroundColor: PropTypes.string,
  children: PropTypes.node
}

export { Avatar }
