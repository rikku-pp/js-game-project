import { useEffect, useState } from 'react'
import { useWindowSize } from '../../../hooks'
import { AngleToDirection } from '../utils'

export const useResponsiveSizing = (sizes, breakpoints, angle, cssVarName) => {
  const { width } = useWindowSize()
  const [size, setSize] = useState(sizes.MEDIUM)
  const [transform, setTransform] = useState(`translateY(-${size / 2}px)`)

  const align = AngleToDirection(
    {
      right: 'right',
      bottom: 'bottom',
      left: 'left',
      top: 'top'
    },
    angle
  )

  useEffect(() => {
    if (width < breakpoints.MEDIUM) {
      setSize(sizes.SMALL)
      cssVarName &&
        document.documentElement.style.setProperty(
          cssVarName,
          `${sizes.SMALL}px`
        )
    } else if (width < breakpoints.LARGE) {
      setSize(sizes.MEDIUM)
      cssVarName &&
        document.documentElement.style.setProperty(
          cssVarName,
          `${sizes.MEDIUM}px`
        )
    } else {
      setSize(sizes.LARGE)
      cssVarName &&
        document.documentElement.style.setProperty(
          cssVarName,
          `${sizes.LARGE}px`
        )
    }
  }, [width, sizes, cssVarName, breakpoints])

  useEffect(() => {
    setTransform(
      AngleToDirection(
        {
          right: `translateY(-${size / 2}px)`,
          bottom: `translateX(-${size / 2}px)`,
          left: `translateY(-${size / 2}px)`,
          top: `translateX(-${size / 2}px)`
        },
        angle
      )
    )
  }, [size, angle])

  return [size, align, transform]
}
