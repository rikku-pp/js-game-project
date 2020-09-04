import React from 'react'
import classnames from 'classnames'
import { Avatar } from '../Avatar'

export const PlayerAvatar = ({ onClick, avatarProps, avatarStyles, inactive }) => {
  return (
    <div
      className={classnames('avatar-container', inactive ? 'inactive' : undefined)}
      style={avatarStyles}
    >
      <Avatar {...avatarProps} onClick={onClick} />
    </div>
  )
}
