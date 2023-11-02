import { Command } from '@commander-js/extra-typings'
import { getClient, getOrganization } from '../state.js'
import parseOrganization from './parseOrg.js'

const command = new Command()
  .name('list')
  .description('List databases')
  .argument(
    '[organization]',
    'the organization to work with (default uses context organization)',
    parseOrganization,
  )
  .option('-b, --branches', 'include branches in the result')
  .option('-v, --verbose', 'show detailed information for every database')
  .option('-a, --all', 'show your databases in all organizations')
  .option('-j, --json', 'show the result in json format')
  .action(async (organization, options) => {
    const org = organization ?? getOrganization()
    const request = getClient().get(`api/db/${org}`).query({
      branches: options.branches,
      verbose: options.verbose,
    })
    if (options.json ?? false) {
      request.pipe(process.stdout)
    } else {
      const response = await request
      if (options.verbose ?? false) {
        renderVerboseResult(response.body)
      } else {
        renderSparseResult(response.body)
      }
    }
  })

interface Sparse {
  path: string
  branches?: string[]
}

interface Verbose {
  name: string
  label: string
  comment: string
  creation_date: string
  state: string
  path: string
  branches?: string[]
}

const JOINT = '└──'
const ARM = '├──'

function renderBranches(indent: number, branches: string[] | undefined): void {
  if (branches === undefined) {
    return
  }
  const spacer = ' '.repeat(indent + 2)
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
      console.log(`${ARM} branches:`)
      renderBranches(1, record.branches)
    }
  }
}

export default command
