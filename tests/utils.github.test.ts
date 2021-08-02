import test from 'tape'
import nock from 'nock'
import { getPullRequestNumber, getWorkflowRuns } from '../utils/github'
import * as pkg from '../package.json'
import type { Body, Scope } from 'nock'

const FIXTURES = {
  SELF_RUN_CONTEXT: import('./fixtures/utils.github/self-run.json'),
  WORKFLOW_RUN_CONTEXT: import('./fixtures/utils.github/workflow-run.json'),
  WORKFLOW_DISPATCH_CONTEXT: import(
    './fixtures/utils.github/workflow-dispatch.json'
  ),
  TOKEN: 'ABC123',
  REPO_OWNER: 'getoslash',
  REPO_NAME: 'github-build-stats-action',
  WORKFLOW_ID: 12345,
} as const

const mockGetWorkflowRuns = (returnData: Body): Scope => {
  return nock('https://api.github.com', {
    reqheaders: {
      authorization: `token ${FIXTURES.TOKEN}`,
      'user-agent': (ua) => ua.startsWith(pkg.name),
    },
  })
    .get(`/repos/${FIXTURES.REPO_OWNER}/${FIXTURES.REPO_NAME}/actions/runs`)
    .query({
      workflow_id: FIXTURES.WORKFLOW_ID,
      status: 'completed',
      per_page: 100,
    })
    .reply(200, returnData)
}

test('🧪 getPullRequestNumber() should return PR number correctly', async (t) => {
  t.plan(4)
  t.equal(
    // @ts-ignore -- GitHub contexts are actually wildly complex to type correctly.
    getPullRequestNumber(await FIXTURES.SELF_RUN_CONTEXT),
    188765,
    'should get PR number correctly from a simple pull request event'
  )
  t.equal(
    // @ts-ignore -- GitHub contexts are actually wildly complex to type correctly.
    getPullRequestNumber(await FIXTURES.WORKFLOW_RUN_CONTEXT),
    19781,
    'should get PR number correctly from a `workflow_run` event'
  )
  t.equal(
    // @ts-ignore -- GitHub contexts are actually wildly complex to type correctly.
    getPullRequestNumber(await FIXTURES.WORKFLOW_DISPATCH_CONTEXT),
    19983,
    'should get PR number correctly from a `workflow_dispatch` event'
  )
  t.equal(
    // @ts-expect-error -- We're intentionally sending an invalid context payload.
    getPullRequestNumber({}),
    null,
    'should return `null` when given an invalid context'
  )
  t.end()
})

test('🧪 getWorkflowRuns() should return workflow run data from GitHub', async (t) => {
  nock.disableNetConnect()
  mockGetWorkflowRuns(['data'])
  const result = await getWorkflowRuns(FIXTURES.TOKEN, FIXTURES.WORKFLOW_ID, {
    owner: FIXTURES.REPO_OWNER,
    repo: FIXTURES.REPO_NAME,
  })
  t.deepEqual(result, ['data'], 'should mock GitHub API call correctly')
  nock.cleanAll()
  nock.enableNetConnect()
  t.end()
})
