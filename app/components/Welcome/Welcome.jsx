import React from 'react'
import useFetch from 'use-http'
import { apiUrl, apiOptions } from '../../api-utils'
import './Welcome.css'

import { Loader } from '../Loader'
import { WelcomeImage } from './WelcomeImage'
import { PlayerReg } from './PlayerReg'

const Welcome = () => {
  const { data, loading, error } = useFetch(
    `${apiUrl}/suggestions`,
    apiOptions,
    []
  )

  if (error) return <Loader status={'OFFLINE'}>No server</Loader>

  return (
    <div className="welcome-container">
      <div className="welcome-header">Welcome to Patterns II</div>
      <WelcomeImage />
      {loading ? (
        <div className="reg-container">
          <Loader status={'LOADING'} />
        </div>
      ) : (
        <PlayerReg suggestions={data.suggestions} />
      )}
    </div>
  )
}

export { Welcome }
