import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import parseDb from '../db/parseDb.js'

const command = new Command()
  .name('list')
  .description('List branches')
  .argument('<db>', 'a database', parseDb)
  .action(async (spec, branch, options) => {
    const request = getClient()
      .get(`api/db/${spec.resource}`)
      .type('json')
      .query({
        branches: true,
        verbose: false,
      })

    const response = await request.ok(
      (r) => r.status === 200 || r.status === 404,
    )
    if (response.status === 404) {
      console.error('Database not found')
      process.exit(1)
    }

    for (const branch of response.body.branches) {
      console.log(branch)
    }
  })
export default command
