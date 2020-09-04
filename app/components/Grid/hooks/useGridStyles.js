import { useWindowSize } from '../../../hooks'
import { getScreenSize } from '../../PlayerList/PlayerItem'
import { AvatarSizes } from '../../../constants.json'

export const useGridStyles = () => {
  const { width, height } = useWindowSize()

  const margin = 2 * AvatarSizes[getScreenSize(width)]
  const containerStyles = { margin }

  const gridSize = (width > height ? height : width) - 2 * margin
  const sizeDiff = Math.max(width, height) - Math.min(width, height)
  const squareModifier = sizeDiff < 150 ? 150 - sizeDiff : 0
  const gridStyles = {}
  gridStyles.minWidth = gridStyles.minHeight = gridStyles.maxWidth = gridStyles.maxHeight =
    gridSize - squareModifier

  return { containerStyles, gridStyles }
}
