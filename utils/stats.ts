import { default as p } from 'percentile'
import { diff } from './datetime'
import type { WorkflowRunData } from './github'

export interface WorkflowRunTimeStats {
  /** Time taken by the fastest workflow run. */
  min: number
  /** Time taken by the slowest workflow run.  */
  max: number
  /** Average time taken by the workflow run. */
  avg: number
  /** [99th percentile](https://medium.com/last9/your-percentiles-are-incorrect-p99-of-the-times-11436c97d524) of the time taken by the workflow run. */
  p99: number
  /** [90th percentile](https://medium.com/last9/your-percentiles-are-incorrect-p99-of-the-times-11436c97d524) of the time taken by the workflow run. */
  p90: number
  /** [50th percentile](https://medium.com/last9/your-percentiles-are-incorrect-p99-of-the-times-11436c97d524) of the time taken by the workflow run. */
  p50: number
  /** The percentile the given value falls under (in increments of 1%) */
  percentile: number
}

/**
 * Round off number to given decimal places.
 
 * @param number Number to round off.
 * @param decimalPlaces Number of decimal places to round off to. @default 2
 * @returns Number with rounded off decimal places.
 */
const roundOff = (number: number, decimalPlaces = 2): number => {
  return (
    Math.round((number + Number.EPSILON) * 10 ** decimalPlaces) /
    10 ** decimalPlaces
  )
}

/**
 * Remove duplicates from a given array.
 *
 * @param array Array to remove duplicates from.
 * @returns Array without duplicates.
 */
const removeDuplicates = <T>(array: Array<T>): Array<T> => {
  return array.filter((value, index, self) => {
    return self.indexOf(value) === index
  })
}

/**
 * For a given range of numbers and a specific number,
 * returns the percentile where that number falls in the range.
 *
 * @param numberToFind Number to find percentile for.
 * @param numbers Data to calculate the percentile from.
 * @returns Percentile of the number.
 */
const findPercentile = (
  numberToFind: number,
  numbers: Array<number>
): number => {
  const percentileRange = Array.from(Array(101).keys()).filter((_) => _ > 0)
  const percentiles = p(
    percentileRange,
    removeDuplicates(numbers)
  ) as Array<number>
  const position = percentiles.reduce((prev, curr) => {
    return Math.abs(curr - numberToFind) < Math.abs(prev - numberToFind)
      ? curr
      : prev
  })
  return percentileRange[percentiles.lastIndexOf(position)]
}

/**
 * Returns workflow run statistics.
 *
 * @param runData Workflow runs data from GitHub.
 * @param latestRunTime The latest workflow run's time (in milliseconds).
 * @returns Workflow run statistics.
 */
export const getWorkflowRunStats = (
  runData: WorkflowRunData,
  latestRunTime: number
): WorkflowRunTimeStats => {
  const runTimes = runData.map((r) => diff(r.created_at, r.updated_at))

  const max = Math.max(...runTimes)
  const min = Math.min(...runTimes)
  const avg = roundOff(
    runTimes.reduce((rt1, rt2) => rt1 + rt2, 0) / runTimes.length
  )
  const [p99, p90, p50] = p([99, 90, 50], runTimes) as Array<number>
  const percentile = findPercentile(latestRunTime, runTimes)
  return {
    min,
    max,
    avg,
    p99,
    p90,
    p50,
    percentile,
  }
}
