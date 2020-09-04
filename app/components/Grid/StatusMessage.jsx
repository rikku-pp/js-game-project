import React from 'react'
import './StatusMessage.css'

export const StatusMessage = ({ children }) => (
  <div className="status-message-container">
    <div className="status-message-small">{children}</div>
  </div>
)

export const StatusTitle = ({ hidden, size, children }) => (
  <div
    className="status-title"
    style={{
      display: hidden ? 'none' : 'flex',
      minHeight: size.minHeight,
      maxHeight: size.maxHeight
    }}
  >
    {children}
  </div>
)
