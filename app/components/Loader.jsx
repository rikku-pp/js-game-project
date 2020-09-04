import React from 'react'
import './Loader.css'

export const LOADING = '⏳'
export const SUCCESS = '✔'
export const FAIL = '😵'
export const OFFLINE = '🏝'
export const IN_PROGRESS = '🎬'

const busyMatcher = new RegExp(`${LOADING}|${FAIL}|${SUCCESS}`)
export const isBusy = (status) => busyMatcher.test(status)

const ICONS = { LOADING, SUCCESS, FAIL, OFFLINE }

export const Loader = ({ status, children }) => (
  <div className="loading-icon" style={{ display: status !== '' ? 'inline-block' : 'none' }}>
    <span title="Loading" role="img" aria-label="Loading">
      {children}
      {ICONS[status] || ''}
    </span>
  </div>
)
