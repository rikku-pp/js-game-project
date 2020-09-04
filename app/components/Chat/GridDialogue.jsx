import React from 'react'
import classnames from 'classnames'
import { Cell } from '../Grid'
import './GridDialogue.css'

export const GridDialogue = ({
  ownStyles,
  ownGrid,
  wasDesigner,
  otherPlayer,
  otherGrid,
  otherStyles,
  otherWasDesigner
}) => {
  return (
    <div className="grid-dialogue">
      <div className="grid-container">
        <div>
          <div className="grid-title">
            {`${wasDesigner ? '🎨 YOU' : 'YOU'}`}
            {Array.isArray(ownGrid.data) && ownGrid.isSubmitted && !wasDesigner && (
              <b>
                &nbsp;&mdash;&nbsp;
                {ownGrid.data.reduce((acc, next) => {
                  if (next[1] === '❓') {
                    return acc
                  } else if (next[2] === '❗') {
                    return acc - 1
                  }
                  return acc + 1
                }, 0)}
                p
              </b>
            )}
          </div>
          <div
            className={classnames('grid', !ownGrid.data ? 'blank' : undefined)}
            style={{ background: ownStyles }}
          >
            {Array.isArray(ownGrid.data) &&
              ownGrid.data.map(([char, cluemark, failmark], i) => (
                <Cell
                  key={i}
                  char={char}
                  index={i}
                  interactionMode={cluemark ? 'clued' : ownGrid.isSubmitted ? 'submitted' : ''}
                  failModifier={failmark ? 'incorrect' : ''}
                />
              ))}
          </div>
        </div>
      </div>
      <div className="grid-container-separator"></div>
      <div className="grid-container">
        <div>
          <div className="grid-title">
            {`${otherWasDesigner ? '🎨 ' : ''}`}
            {otherPlayer.name || ''}
            {Array.isArray(otherGrid.data) && otherGrid.isSubmitted && !otherWasDesigner && (
              <b>
                &nbsp;&mdash;&nbsp;
                {otherGrid.data.reduce((acc, next) => {
                  if (next[1] === '❓') {
                    return acc
                  } else if (next[2] === '❗') {
                    return acc - 1
                  }
                  return acc + 1
                }, 0)}
                p
              </b>
            )}
          </div>

          <div
            className={classnames('grid', !otherGrid.data ? 'blank' : undefined)}
            style={{ background: otherStyles }}
          >
            {Array.isArray(otherGrid.data) &&
              otherGrid.data.map(([char, cluemark, failmark], i) => (
                <Cell
                  key={i}
                  char={char}
                  index={i}
                  interactionMode={cluemark ? 'clued' : otherGrid.isSubmitted ? 'submitted' : ''}
                  failModifier={failmark ? 'incorrect' : ''}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
