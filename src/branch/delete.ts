import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import { withParsedBranch } from '../parse.js'

const command = new Command()
  .name('delete')
  .description('Delete a branch')
  .argument('[branch...]', 'the branch to delete')
  .action(
    withParsedBranch(async (branch, _options) => {
      const request = getClient()
        .delete(`api/branch/${branch.resource}`)
        .type('json')
        .send({})

      request.pipe(process.stdout)
    }),
  )
export default command
