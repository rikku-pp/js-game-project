import { useEffect, useState, useCallback } from 'react'

const debounce = (delay, fn) => {
  let timerId

  return function(...args) {
    if (timerId) {
      clearTimeout(timerId)
    }

    timerId = setTimeout(() => {
      fn(...args)
      timerId = null
    }, delay)
  }
}

export const useWindowSize = (debounceTime = 250) => {
  const isClient = typeof window === 'object'
  const getSize = useCallback(
    () => ({
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    }),
    [isClient]
  )
  const [windowSize, setWindowSize] = useState(getSize)

  useEffect(() => {
    if (!isClient) {
      return
    }

    const handleResize = () => {
      setWindowSize(getSize())
    }

    let handleResizeFn = handleResize

    if (debounceTime) {
      handleResizeFn = debounce(debounceTime, handleResize)
    }

    window.addEventListener('resize', handleResizeFn)

    return () => window.removeEventListener('resize', handleResizeFn)
  }, [debounceTime, getSize, isClient])

  return windowSize
}
