import React from 'react'

export const READY_STATE_CONNECTING = 0
export const READY_STATE_OPEN = 1
export const READY_STATE_CLOSED = 2

export const useSSE = (url, onMessage) => {
  const [readyState, setReadyState] = React.useState(READY_STATE_CLOSED)
  const [errorState, setErrorState] = React.useState(null)
  const [currentUrl, setCurrentUrl] = React.useState('')

  const sseRef = React.useRef()

  const openEvents = React.useCallback(
    function openSSE(newUrl, onSuccess, onError) {
      newUrl !== currentUrl && setCurrentUrl(newUrl)
      const eventSource = new EventSource(newUrl)
      eventSource.onopen = () => {
        setReadyState(READY_STATE_OPEN)
        setErrorState(null)
        onSuccess()
      }
      eventSource.onerror = (err) => {
        console.log(err)
        setErrorState(err)
        closeEvents()
        setTimeout(() => openEvents(newUrl, () => console.log('reconnected')), 2500)
        typeof onError === 'function' && onError(err)
      }
      eventSource.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data)
          console.log(data)
          onMessage(data)
        } catch (e) {
          if (readyState === READY_STATE_CLOSED) {
            closeEvents()
            window.alert('Game ended by host')
            window.location.reload(true)
          }
        }
      }
      sseRef.current = eventSource
    },
    [onMessage, currentUrl, setCurrentUrl, readyState]
  )

  function closeEvents() {
    if (sseRef.current && sseRef.current.close) {
      sseRef.current.close()
      sseRef.current = undefined
      setReadyState(READY_STATE_CLOSED)
    }
  }

  return React.useMemo(() => {
    return {
      readyState,
      errorState,
      closeEvents,
      openEvents
    }
  }, [openEvents, readyState, errorState])
}
