import test from 'tape'
import { diff } from '../utils/datetime'
import { getWorkflowRunStats } from '../utils/stats'
import type { WorkflowRunData } from '../utils/github'

const FIXTURES = {
  RUN_DATA: import('./fixtures/utils.stats/runs.json'),
} as const

test('🧪 getWorkflowRunStats() should return, well, workflow run stats', async (t) => {
  t.plan(1)
  const runData = (await FIXTURES.RUN_DATA).default as WorkflowRunData
  const latestRunTime = diff(runData[0].created_at, runData[0].updated_at)
  const stats = getWorkflowRunStats(runData, latestRunTime)
  t.deepEqual(
    stats,
    {
      min: 15000,
      max: 112000,
      avg: 27615.38,
      p99: 112000,
      p90: 42000,
      p50: 19000,
      percentile: 64,
    },
    'should return correct stats'
  )
  t.end()
})
