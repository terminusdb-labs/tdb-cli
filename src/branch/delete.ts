import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import interpretArgs from './interpretArgs.js'

const command = new Command()
  .name('delete')
  .description('Delete a branch')
  .argument('<spec>', 'either a full resource path or a database name')
  .argument('[branch]', 'the branch to delete')
  .option('--no-origin', 'disable origin')
  .option('--no-schema', 'disable schema')
  .option('-d, --data-prefix <data-prefix>', 'uri prefix to use for data')
  .option('-s, --schema-prefix <schema-prefix>', 'uri prefix to use for schema')
  .option(
    '-x, --prefixes <prefixes>',
    'additional defined prefixes in JSON',
    JSON.parse,
  )
  .action(async (spec, branch, options) => {
    const resource = interpretArgs(spec, branch)
    const request = getClient()
      .delete(`api/branch/${resource}`)
      .type('json')
      .send({})

    request.pipe(process.stdout)
  })
export default command
