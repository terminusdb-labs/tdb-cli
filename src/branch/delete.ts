import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import { parseBranch } from '../parse.js'

const command = new Command()
  .name('delete')
  .description('Delete a branch')
  .argument('[branch...]', 'the branch to delete')
  .option('--no-origin', 'disable origin')
  .option('--no-schema', 'disable schema')
  .option('-d, --data-prefix <data-prefix>', 'uri prefix to use for data')
  .option('-s, --schema-prefix <schema-prefix>', 'uri prefix to use for schema')
  .option(
    '-x, --prefixes <prefixes>',
    'additional defined prefixes in JSON',
    JSON.parse,
  )
  .action(async (spec, options) => {
    const branch = parseBranch(spec)
    const request = getClient()
      .delete(`api/branch/${branch.resource}`)
      .type('json')
      .send({})

    request.pipe(process.stdout)
  })
export default command
