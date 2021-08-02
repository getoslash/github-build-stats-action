import test from 'tape'
import { diff, humanise } from '../utils/datetime'

const FIXTURES = {
  START_TIME: '1987-11-20T05:30:00Z',
  END_TIME: '2005-11-20T17:30:01Z',
} as const

test('🧪 diff() should return time difference', (t) => {
  t.plan(3)
  const startTime = FIXTURES.START_TIME
  const endTime = FIXTURES.END_TIME
  t.equal(
    diff(startTime, endTime),
    568123201000,
    'should return diff correctly in milliseconds'
  )
  t.equal(
    diff(startTime, endTime, {
      unit: 'years',
    }),
    18,
    'should return diff correctly in years'
  )
  t.equal(
    diff(startTime, endTime, {
      unit: 'years',
      float: true,
    }),
    18.001344117134607,
    'should return diff correctly in years along with decimal precision'
  )
  t.end()
})

test('🧪 humanise() should return human-friendly time durations', (t) => {
  t.plan(1)
  const startTime = FIXTURES.START_TIME
  const endTime = FIXTURES.END_TIME
  t.equal(
    humanise({
      milliseconds: diff(startTime, endTime),
    }),
    '18 years',
    'should return human-friendly duration'
  )
  t.end()
})
