import { hrtime } from 'process'
import * as core from '@actions/core'
import * as github from '@actions/github'
import { diff, humanise } from './utils/datetime'
import { getPullRequestNumber, getWorkflowRuns } from './utils/github'
import { getWorkflowRunStats } from './utils/stats'
import { getSpeedScore } from './utils/score'
import { buildMarkdownTable } from './utils/markdown'
import type { Context } from '@actions/github/lib/context'

/**
 * Input options to the main `run()` method.
 */
export interface ActionOptions {
  /** GitHub API [token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token). This token will be used to get workflow data and post comment on PRs. */
  githubToken: string
  /** GitHub Action context. */
  context: Context
  /** Worfklow ID of the workflow to get statistics for. It can be either the workflow ID or the workflow YML file's name. */
  workflowId: string | number
  /** (Optional) Pull request number. If this is not provided, attempts will be made to guess it. */
  pullRequestNumber?: number
}

const PERCENTILE_HELP_LINK =
  'https://medium.com/last9/your-percentiles-are-incorrect-p99-of-the-times-11436c97d524' as const

/**
 * Collect information about all workflow runs on the repository
 * and build statistics, comparing the historical run times with
 * the latest run.
 *
 * @param options Input options.
 * @returns PR comment body.
 */
export async function run({
  githubToken,
  context,
  workflowId,
  pullRequestNumber,
}: ActionOptions): Promise<void | Array<string>> {
  try {
    core.debug(`GitHub context: ${JSON.stringify(context, null, 2)}`)
    const prNumber = pullRequestNumber || getPullRequestNumber(context)
    if (!prNumber) {
      core.setFailed('No pull request found.')
      return
    }

    const repository = {
      owner: context.payload.repository?.owner.login as string,
      repo: context.payload.repository?.name as string,
    }
    core.debug(`Repository: ${JSON.stringify(repository, null, 2)}`)
    const startFetch = hrtime.bigint()
    const runData = await getWorkflowRuns(githubToken, workflowId, repository)
    const endFetch = hrtime.bigint()
    core.debug(
      `Finished fetching ${runData.length} workflow runs from GitHub API: ${
        Number(endFetch - startFetch) / 1000000
      } milliseconds`
    )
    core.debug(`Worflow run data: ${JSON.stringify(runData, null, 2)}`)
    const latestRunTime = diff(runData[0].created_at, runData[0].updated_at)
    const runTimeStats = getWorkflowRunStats(runData, latestRunTime)
    core.debug(
      `Finished collecting build statistics: ${JSON.stringify(runTimeStats)}`
    )
    const outputTable = buildMarkdownTable([
      [
        'Fastest',
        'Average',
        `[p90](${PERCENTILE_HELP_LINK})`,
        `[p99](${PERCENTILE_HELP_LINK})`,
        'Slowest',
      ],
      [
        runTimeStats.min,
        runTimeStats.avg,
        runTimeStats.p90,
        runTimeStats.p99,
        runTimeStats.max,
      ].map(
        (ms) =>
          `${ms} ms (${humanise({
            milliseconds: ms,
          })})`
      ),
    ])
    const octokit = github.getOctokit(githubToken)
    const commentBody = [
      `The workflow run took \`${latestRunTime}\` milliseconds (${humanise({
        milliseconds: latestRunTime,
      })}), and was faster than ${getSpeedScore(runTimeStats.percentile)} **${
        100 - runTimeStats.percentile
      }%** of the past ${runData.length} workflow runs.`,
      `${outputTable}`,
    ]
    const newComment = octokit.rest.issues.createComment({
      ...repository,
      issue_number: prNumber,
      body: commentBody.join('\n'),
    })
    core.debug(`Create comment result: ${JSON.stringify(newComment, null, 2)}`)
    core.setOutput('stats', runTimeStats)
    return commentBody
  } catch (error) {
    const { name, message } = error as Error
    core.setFailed(`Error ${name} – ${message}`)
  }
}

/* istanbul ignore next */
if (require.main === module) {
  const githubToken = core.getInput('token', {
    required: true,
  })

  const workflowId = core.getInput('workflowId', {
    required: true,
  })

  const pullRequestNumber = core.getInput('pullRequest', {
    required: false,
  })

  const context = github.context

  ;(async (): Promise<void> => {
    await run({
      githubToken,
      context,
      workflowId,
      pullRequestNumber: pullRequestNumber
        ? parseInt(pullRequestNumber, 10)
        : undefined,
    })
  })()
}
