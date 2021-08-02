import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { QUnitType, OpUnitType, ConfigType } from 'dayjs'
import type { DurationUnitsObjectType } from 'dayjs/plugin/duration'

dayjs.extend(duration)
dayjs.extend(relativeTime)

/**
 * Returns time difference between 2 time fields.
 *
 * @param timeA Starting time.
 * @param timeB Ending time.
 * @param options (Optional) Additional options.
 * @returns Time difference.
 */
export const diff = (
  timeA: ConfigType,
  timeB: ConfigType,
  options?: {
    unit?: QUnitType | OpUnitType
    float?: boolean
  }
): number => {
  const started = dayjs(timeA)
  const ended = dayjs(timeB)
  const diff = ended.diff(
    started,
    options?.unit ? options.unit : undefined,
    options?.float ? options.float : undefined
  )
  return diff
}

/**
 * Humanises a time duration.
 *
 * @param duration Time duration.
 * @returns Human-readable time duration.
 */
export const humanise = (duration: DurationUnitsObjectType): string =>
  dayjs.duration(duration).humanize()
