import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import { withParsedBranch } from '../parse.js'

const command = new Command()
  .name('reset')
  .description('Reset a branch to another commit')
  .argument('[branch...]', 'the branch to reset')
  .requiredOption('-c, --commit <commit>', 'commit id to reset the branch to')
  .action(
    withParsedBranch(async (branch, options) => {
      const request = getClient()
        .post(`api/reset/${branch.resource}`)
        .type('json')
        .send({ commit_descriptor: options.commit })
        .ok((_) => true)

      const response = await request
      if (response.status === 200) {
        console.log('branch reset.')
      } else {
        if (typeof response.body === 'object') {
          const body = response.body as { 'api:message'?: string }
          if (body['api:message'] !== undefined) {
            console.error(body['api:message'])
            process.exit(1)
          }
        }
        // something went wrong but it didn't go wrong in a way that gives us an easy message
        console.error(`Reset returned status ${response.status}`)
        console.error(response.body)
        process.exit(1)
      }
    }),
  )
export default command
