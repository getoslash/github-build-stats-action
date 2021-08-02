import test from 'tape'
import nock from 'nock'
import hookStd from 'hook-std'
import { run } from '../main'
import * as pkg from '../package.json'
import type { Body, Interceptor } from 'nock'
import type { Context } from '@actions/github/lib/context'

const FIXTURES = {
  TOKEN: 'ABC123',
  REPO_OWNER: 'getoslash',
  REPO_NAME: 'github-build-stats-action',
  WORKFLOW_ID: 12345,
  CONTEXT: import('./fixtures/main/context.json'),
  WORKFLOW_RUNS: import('./fixtures/main/runs.json'),
} as const

const interceptGetWorkflowRuns = (): Interceptor => {
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
}

const mockPostIssueComment = (number: number, returnData: Body) => {
  return nock('https://api.github.com', {
    reqheaders: {
      authorization: `token ${FIXTURES.TOKEN}`,
    },
  })
    .post(
      `/repos/${FIXTURES.REPO_OWNER}/${FIXTURES.REPO_NAME}/issues/${number}/comments`
    )
    .reply(200, returnData)
}

test('🧪 main() should return the constructed PR message body', async (t) => {
  t.plan(1)
  nock.disableNetConnect()
  const outputHook = hookStd(
    {
      silent: true,
      once: false,
    },
    /* eslint-disable @typescript-eslint/no-empty-function */
    () => {}
    /* eslint-enable @typescript-eslint/no-empty-function */
  )
  // @ts-ignore -- GitHub contexts are actually wildly complex to type correctly.
  const context = (await FIXTURES.CONTEXT) as Context
  const workflowRuns = (await FIXTURES.WORKFLOW_RUNS).default
  interceptGetWorkflowRuns().reply(200, workflowRuns)
  mockPostIssueComment(3, { ok: true })
  const result = await run({
    githubToken: FIXTURES.TOKEN,
    context,
    workflowId: FIXTURES.WORKFLOW_ID,
  })
  outputHook.unhook()
  await outputHook
  t.deepEqual(
    result,
    [
      'The workflow run took `33000` milliseconds (a few seconds), and was faster than 🟠 **29%** of the past 46 workflow runs.',
      '| Fastest | Average | [p90](https://medium.com/last9/your-percentiles-are-incorrect-p99-of-the-times-11436c97d524) | [p99](https://medium.com/last9/your-percentiles-are-incorrect-p99-of-the-times-11436c97d524) | Slowest |\n| - | -- | -- | -- | - |\n| 15000 ms (a few seconds) | 25717.39 ms (a few seconds) | 35000 ms (a few seconds) | 112000 ms (2 minutes) | 112000 ms (2 minutes) |',
    ],
    'should return the markdown'
  )
  nock.enableNetConnect()
  nock.cleanAll()
  t.end()
})

test('🧪 main() should return the constructed PR message body for a given PR number', async (t) => {
  t.plan(1)
  nock.disableNetConnect()
  const outputHook = hookStd(
    {
      silent: true,
      once: false,
    },
    /* eslint-disable @typescript-eslint/no-empty-function */
    () => {}
    /* eslint-enable @typescript-eslint/no-empty-function */
  )
  // @ts-ignore -- GitHub contexts are actually wildly complex to type correctly.
  const context = (await FIXTURES.CONTEXT) as Context
  const workflowRuns = (await FIXTURES.WORKFLOW_RUNS).default
  const prNumber = 12
  interceptGetWorkflowRuns().reply(200, workflowRuns)
  mockPostIssueComment(prNumber, { ok: true })
  const result = await run({
    githubToken: FIXTURES.TOKEN,
    context,
    workflowId: FIXTURES.WORKFLOW_ID,
    pullRequestNumber: prNumber,
  })
  outputHook.unhook()
  await outputHook
  t.deepEqual(
    result,
    [
      'The workflow run took `33000` milliseconds (a few seconds), and was faster than 🟠 **29%** of the past 46 workflow runs.',
      '| Fastest | Average | [p90](https://medium.com/last9/your-percentiles-are-incorrect-p99-of-the-times-11436c97d524) | [p99](https://medium.com/last9/your-percentiles-are-incorrect-p99-of-the-times-11436c97d524) | Slowest |\n| - | -- | -- | -- | - |\n| 15000 ms (a few seconds) | 25717.39 ms (a few seconds) | 35000 ms (a few seconds) | 112000 ms (2 minutes) | 112000 ms (2 minutes) |',
    ],
    'should return the markdown'
  )
  nock.enableNetConnect()
  nock.cleanAll()
  t.end()
})

test('🧪 main() should fail with an error if PR number cannot be found', async (t) => {
  t.plan(2)
  const context = {} as Context
  const outputLines = [] as Array<string>
  const outputHook = hookStd(
    {
      silent: true,
      once: false,
    },
    (output) => {
      outputLines.push(output)
    }
  )
  const result = await run({
    githubToken: FIXTURES.TOKEN,
    context,
    workflowId: FIXTURES.WORKFLOW_ID,
  })
  outputHook.unhook()
  await outputHook
  t.equal(result, undefined, 'should not return anything')
  t.true(
    outputLines[1].startsWith('::error::No pull request found.'),
    'should print correct error output'
  )
  t.end()
})

test("🧪 main() should fail with error name and message if there's an unknown exception", async (t) => {
  t.plan(2)
  nock.disableNetConnect()
  const outputLines = [] as Array<string>
  const outputHook = hookStd(
    {
      silent: true,
      once: false,
    },
    (output) => {
      outputLines.push(output)
    }
  )
  // @ts-ignore -- GitHub contexts are actually wildly complex to type correctly.
  const context = (await FIXTURES.CONTEXT) as Context
  interceptGetWorkflowRuns().reply(500, 'Oops')
  const result = await run({
    githubToken: FIXTURES.TOKEN,
    context,
    workflowId: FIXTURES.WORKFLOW_ID,
  })
  outputHook.unhook()
  await outputHook
  t.equal(result, undefined, 'should not return anything')
  t.true(
    outputLines[2].startsWith('::error::Error HttpError – Oops'),
    'should print correct error output'
  )
  nock.enableNetConnect()
  nock.cleanAll()
  t.end()
})
