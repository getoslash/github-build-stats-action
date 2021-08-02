export enum SPEED_SCORES {
  GREEN = '🟢',
  YELLOW = '🟡',
  AMBER = '🟠',
  RED = '🔴',
  UNKNOWN = '',
}

/**
 * Returns a colour-coded score for a given percentile.
 *
 * @param percentile Percentile (higher = slower)
 * @returns Speed score, duh.
 */
export const getSpeedScore = (percentile: number): SPEED_SCORES => {
  if (!percentile) return SPEED_SCORES.UNKNOWN
  else if (percentile >= 90) return SPEED_SCORES.RED
  else if (percentile >= 65) return SPEED_SCORES.AMBER
  else if (percentile >= 45) return SPEED_SCORES.YELLOW
  else return SPEED_SCORES.GREEN
}
