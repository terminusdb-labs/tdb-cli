import { Command } from '@commander-js/extra-typings'
import { getClient } from './state.js'
import { parseResource } from './parse.js'

const command = new Command()
  .name('log')
  .description('retrieve a log')
  .argument('[resource...]', 'the resource to get a log for')
  .option(
    '-s, --start <start>',
    'How far back in commit log to start giving results',
    parseInt,
  )
  .option('-c, --count <count>', 'Number of results to return', parseInt)
  .option('-v, --verbose', 'Give back additional information on commits')
  .option('-j, --json', 'return log as JSON')
  .action(async (spec, options) => {
    const branch = parseResource(spec)
    const request = getClient()
      .get(`api/log/${branch.resource}`)
      .query({
        start: options.start,
        count: options.count,
        verbose: options.verbose,
      })
      .ok((r) => r.status === 200 || r.status === 404)

    if (options.json ?? false) {
      request.pipe(process.stdout)
    } else {
      const response = await request
      if (response.status === 404) {
        console.error('resource not found')
        process.exit(1)
      }
      renderResult(response.body, options.verbose ?? false)
    }
  })

interface Commit {
  identifier: string
  author: string
  message: string
  timestamp: number
  migration?: object
}

function renderResult(commits: Commit[], includeMigration: boolean): void {
  for (const commit of commits) {
    renderCommit(commit, includeMigration)
  }
}

function renderCommit(commit: Commit, includeMigration: boolean): void {
  console.log(commit.identifier)
  console.log('-'.repeat(commit.identifier.length))
  const timestamp = new Date(commit.timestamp * 1000)
  const iso8601String = timestamp.toISOString()
  console.log(`Date: ${iso8601String}`)
  console.log(`Author: ${commit.author}`)
  console.log(`Message: ${commit.message}`)
  if (includeMigration && commit.migration !== undefined) {
    console.log('Migration:')
    console.log(commit.migration)
  }
  console.log('')
}

export default command
