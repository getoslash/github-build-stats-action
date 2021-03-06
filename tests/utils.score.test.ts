import test from 'tape'
import { getSpeedScore } from '../utils/score'

test('๐งช getSpeedScore() should return, well, a speed score', (t) => {
  t.plan(5)
  t.equal(
    getSpeedScore(44.9),
    '๐ข',
    'should return green for a good percentile'
  )
  t.equal(getSpeedScore(45), '๐ก', 'should return yellow for a low percentile')
  t.equal(
    getSpeedScore(65),
    '๐ ',
    'should return amber for a decent percentile'
  )
  t.equal(getSpeedScore(90), '๐ด', 'should return red for a bad percentile')
  t.equal(
    getSpeedScore(0),
    '',
    'should return an empty string for an invalid percentile'
  )
  t.end()
})
