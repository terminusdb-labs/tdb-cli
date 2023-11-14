import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import { type Verbose, renderBranches } from './list.js'
import { withParsedDb } from '../parse.js'

const command = new Command()
  .name('info')
  .description('Print database information')
  .argument('[database...]', 'the database to work with')
  .option('-b, --branches', 'include branches in the result')
  .option('-j, --json', 'show the result in json format')
  .action(
    withParsedDb(async (db, options) => {
      const request = getClient().get(`api/db/${db.resource}`).query({
        branches: options.branches,
        verbose: true,
      })
      if (options.json ?? false) {
        // todo fail properly in case of not found
        request.pipe(process.stdout)
      } else {
        const response = await request.ok(
          (r) => r.status === 200 || r.status === 404,
        )
        if (response.status === 404) {
          console.error('Database not found')
          process.exit(1)
        }

        renderResult(response.body)
      }
    }),
  )

function renderResult(record: Verbose): void {
  console.log(`name: ${record.name}`)
  console.log(`label: ${record.label}`)
  console.log(`comment: ${record.comment}`)
  console.log(`creation date: ${record.creation_date}`)
  console.log(`state: ${record.state}`)
  if (record.branches !== undefined) {
    console.log('branches:')
    renderBranches(0, record.branches)
  }
}

export default command
