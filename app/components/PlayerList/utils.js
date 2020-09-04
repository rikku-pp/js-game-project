export const AngleToDirection = ({ top, right, bottom, left }, angle) => {
  const pi = Math.PI + 0.0001

  if ((pi / 4 > angle && angle >= 0) || angle >= pi * (7 / 4)) {
    return right
  } else if (pi * (3 / 4) > angle && angle >= pi / 4) {
    return bottom
  } else if (pi * (5 / 4) > angle && angle >= pi * (3 / 4)) {
    return left
  } else {
    return top
  }
}
