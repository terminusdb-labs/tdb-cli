import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import { withParsedOrg } from '../parse.js'

const command = new Command()
  .name('list')
  .description('List databases')
  .argument(
    '[organization...]',
    'the organization to work with (default uses context organization)',
  )
  .option('-b, --branches', 'include branches in the result')
  .option('-v, --verbose', 'show detailed information for every database')
  .option('-a, --all', 'show your databases in all organizations')
  .option('-j, --json', 'show the result in json format')
  .action(
    withParsedOrg(async (organization, options) => {
      let request
      if (options.all) {
        request = getClient().get(`api/db`)
      } else {
        request = getClient().get(`api/db/${organization.organization}`)
      }
      request = request.query({
        branches: options.branches,
        verbose: options.verbose,
      })
      if (options.json ?? false) {
        request.pipe(process.stdout)
      } else {
        const response = await request
        response.body.sort((a: HasPath, b: HasPath) => {
          return a.path.localeCompare(b.path)
        })
        if (options.verbose ?? false) {
          renderVerboseResult(response.body)
        } else {
          renderSparseResult(response.body)
        }
      }
    }),
  )

export interface HasPath {
  path: string
}

export interface Sparse extends HasPath {
  branches?: string[]
}

export interface Verbose extends HasPath {
  name: string
  label: string
  comment: string
  creation_date: string
  state: string
  branches?: string[]
}

const JOINT = '└──'
const ARM = '├──'

export function renderBranches(
  indent: number,
  branches: string[] | undefined,
): void {
  if (branches === undefined) {
    return
  }
  const spacer = ' '.repeat(indent * 3)
  for (let i = 0; i < branches.length; i++) {
    if (i === branches.length - 1) {
      console.log(`${spacer}${JOINT} ${branches[i]}`)
    } else {
      console.log(`${spacer}${ARM} ${branches[i]}`)
    }
  }
}

function renderSparseResult(result: Sparse[]): void {
  for (const record of result) {
    console.log(record.path)
    renderBranches(0, record.branches)
  }
}

function renderVerboseResult(result: Verbose[]): void {
  for (const record of result) {
    console.log(record.path)
    console.log(`${ARM} name: ${record.name}`)
    console.log(`${ARM} label: ${record.label}`)
    console.log(`${ARM} comment: ${record.comment}`)
    console.log(`${ARM} creation date: ${record.creation_date}`)
    if (record.branches === undefined) {
      console.log(`${JOINT} state: ${record.state}`)
    } else {
      console.log(`${ARM} state: ${record.state}`)
      console.log(`${JOINT} branches:`)
      renderBranches(1, record.branches)
    }
  }
}

export default command
