import React from 'react'
import classnames from 'classnames'
import './ActionButtons.css'
import ActionButtonProps from './ActionButtons.json'

export const ActionButton = ({
  type = 'ScoreButton',
  onClick,
  disabled = false,
  confirm,
  ...props
}) => {
  const { label, tip, color, backgroundColor } = ActionButtonProps[type]

  const handleClick = (event) => {
    event.preventDefault()
    if (!disabled) {
      if (confirm) window.confirm(confirm) && onClick(event)
      else onClick(event)
    }
  }

  return (
    <div className={classnames('button-container')} onClick={handleClick}>
      <button
        className={classnames('action-button', disabled && 'disabled')}
        title={disabled ? props.tip || tip : label}
        style={{ color, backgroundColor }}
      >
        {label}
      </button>
    </div>
  )
}
