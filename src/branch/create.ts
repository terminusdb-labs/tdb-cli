import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import { withParsedBranch } from '../parse.js'

const command = new Command()
  .name('create')
  .description('Create a branch')
  .argument('[branch...]', 'the branch to create')
  .option(
    '-o, --origin <origin>',
    'the origin branch to base this branch on',
    'main',
  )
  .option('--no-origin', 'disable origin')
  .option('--no-schema', 'disable schema for new empty branch')
  .option(
    '-x, --prefixes <prefixes>',
    'additional defined prefixes in JSON',
    JSON.parse,
  )
  .action(
    withParsedBranch(async (branch, options) => {
      if (options.origin === false) {
        const request = getClient()
          .post(`api/branch/${branch.resource}`)
          .type('json')
          .send({ prefixes: options.prefixes, schema: options.schema })
        request.pipe(process.stdout)
      } else {
        const request = getClient()
          .post(`api/branch/${branch.resource}`)
          .type('json')
          .send({ origin: options.origin })
        request.pipe(process.stdout)
      }
    }),
  )
export default command
