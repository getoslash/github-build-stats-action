import test from 'tape'
import { getSpeedScore } from '../utils/score'

test('🧪 getSpeedScore() should return, well, a speed score', (t) => {
  t.plan(5)
  t.equal(
    getSpeedScore(44.9),
    '🟢',
    'should return green for a good percentile'
  )
  t.equal(getSpeedScore(45), '🟡', 'should return yellow for a low percentile')
  t.equal(
    getSpeedScore(65),
    '🟠',
    'should return amber for a decent percentile'
  )
  t.equal(getSpeedScore(90), '🔴', 'should return red for a bad percentile')
  t.equal(
    getSpeedScore(0),
    '',
    'should return an empty string for an invalid percentile'
  )
  t.end()
})
