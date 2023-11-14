import { Command, Option } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import { withParsedResource } from '../parse.js'

const command = new Command()
  .name('replace')
  .description('Replace documents')
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
  // the server cli tool has a weird data flag too? what is that about
  .option('-j, --raw-json', 'replace as raw json', false)
  .option('-c, --create', "create document if it doesn't yet exist", false)
  .option(
    '-d, --data <data>',
    'data to submit. This can be a string with a single json document, several documents, or a list of documents. If absent, data is read from STDIN.',
  )
  .action(
    withParsedResource(async (resource, options) => {
      let request = getClient()
        .put(`api/document/${resource.resource}`)
        .set('Content-Type', 'application/json')
        .query({
          author: options.author,
          message: options.message,
          graph_type: options.graph_type,
          require_migration: options.requireMigration,
          allow_destructive_migration: options.allowDestructiveMigration,
          raw_json: options.rawJson,
          create: options.create,
        })
      if (options.data !== undefined) {
        request.send(options.data).pipe(process.stdout)
      } else {
        // this code is super annoying cause it's not properly streaming.
        // the documentation for superagent implies we should be able to pipe directly but I've not been able to get this to work.
        for await (const chunk of process.stdin) {
          request = request.send(chunk.toString())
        }
        request.pipe(process.stdout)
      }
    }),
  )

export default command
