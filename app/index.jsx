import React from 'react'
import ReactDOM from 'react-dom'
import { Game } from './Game'
import { PlayerContextProvider, GridContextProvider } from './contexts'

ReactDOM.render(
  <React.StrictMode>
    <PlayerContextProvider>
      <GridContextProvider>
        <Game />
      </GridContextProvider>
    </PlayerContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
