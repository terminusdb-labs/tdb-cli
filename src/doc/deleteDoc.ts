import { Command, Option } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import { parseResource } from '../parse.js'

const command = new Command()
  .name('delete')
  .description('Delete documents')
  .argument('[resource...]', 'the resource to work with')
  .addOption(
    new Option('-g, --graph_type <graphType>')
      .choices(['schema', 'instance'])
      .default('instance'),
  )
  .option('-a, --author <author>', 'the author of this commit', 'tdb-cli')
  .option(
    '-m, --message <message>',
    'the message to put on the commit',
    'Mutation through the command line interface',
  )
  .option(
    '-r, --require-migration',
    'If this is a schema change, require an inferred migration',
    false,
  )
  .option(
    '-x, --allow-destructive-migration',
    'If this is a schema change, allow inferred migration to be destructive',
    false,
  )
  .option('-i, --id <id>', 'The id of the document to delete')
  // the server cli tool has a weird data flag too? what is that about
  .option('-n, --nuke', 'remove all documents from the graph')
  .action(async (spec, options) => {
    const resource = parseResource(spec)
    let request = getClient()
      .delete(`api/document/${resource.resource}`)
      .set('Content-Type', 'application/json')
      .query({
        author: options.author,
        message: options.message,
        graph_type: options.graph_type,
        require_migration: options.requireMigration,
        allow_destructive_migration: options.allowDestructiveMigration,
      })
    if (options.id !== undefined) {
      request = request.query({ id: options.id })
    }
    if (options.nuke !== undefined) {
      request = request.query({ nuke: true })
    }
    // todo probably something about list of ids that can come from an argument or stdin
    request.pipe(process.stdout)
  })

export default command
