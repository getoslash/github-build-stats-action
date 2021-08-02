import { Octokit } from '@octokit/rest'
import * as pkg from '../package.json'
import type { RestEndpointMethodTypes } from '@octokit/rest'
import type { Context } from '@actions/github/lib/context'
import type { WebhookPayload } from '@actions/github/lib/interfaces'

const USER_AGENT = `${pkg.name}/${pkg.version}` as const

export type WorkflowRunData =
  RestEndpointMethodTypes['actions']['listWorkflowRunsForRepo']['response']['data']['workflow_runs']

/**
 * Gets pull request number from GitHub Action context.
 *
 * Supports a few methods (triggering via `workflow_run` event, triggering
 * via a custom `repository_dispatch` event and triggering in the same workflow).
 *
 * @param context GitHub context available in the workflow run.
 * @returns Pull request number for the originating PR.
 */
export const getPullRequestNumber = (context: Context): number | null => {
  const payload = context.payload
  if (context.eventName === 'workflow_run') {
    return (
      (
        (payload.workflow_run as WebhookPayload).pull_requests as Array<
          NonNullable<WebhookPayload['pull_request']>
        >
      )[0]?.number || null
    )
  } else if (context.eventName === 'repository_dispatch') {
    return Number(
      (payload.client_payload as WebhookPayload).pull_request?.number as number
    )
  } else if (context.eventName === 'pull_request') {
    return payload.pull_request?.number as number
  }
  return null
}

/**
 * Fetches all GitHub Actions workflow runs.
 *
 * @param githubToken GitHub access token.
 * @param workflowId ID of workflow for which you need run data; use the numeric ID or the workflow YAML file's name.
 * @param repository Repository information.
 * @returns Workflow run data.
 */
export const getWorkflowRuns = async (
  githubToken: string,
  workflowId: string | number,
  repository: {
    owner: string
    repo: string
  }
): Promise<WorkflowRunData> => {
  const octokit = new Octokit({
    auth: githubToken,
    userAgent: USER_AGENT,
  })
  const results = await octokit.paginate(
    octokit.actions.listWorkflowRunsForRepo,
    {
      owner: repository.owner,
      repo: repository.repo,
      workflow_id: workflowId,
      status: 'completed',
      per_page: 100,
    }
  )
  return results
}
