import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import mergePrefixes from './mergePrefixes.js'
import { withParsedDb } from '../parse.js'

const command = new Command()
  .name('create')
  .description('Create a database')
  .argument('[database...]', 'the database to work with')
  .option('-l, --label <label>', 'label to use for this database')
  .option('-c, --comment <comment>', 'long description of this database')
  .option('-p, --public', 'whether this database is to be public')
  .option(
    '--no-schema',
    'whether to turn off schema checking for this database',
  )
  .option('-d, --data-prefix <data-prefix>', 'uri prefix to use for data')
  .option('-s, --schema-prefix <schema-prefix>', 'uri prefix to use for schema')
  .option(
    '-x, --prefixes <prefixes>',
    'additional defined prefixes in JSON',
    JSON.parse,
  )
  .action(
    withParsedDb(async (db, options) => {
      const prefixes = mergePrefixes(
        options.dataPrefix,
        options.schemaPrefix,
        // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
        options.prefixes as { [key: string]: string } | undefined,
      )
      let label = options.label
      if (label === undefined) {
        // default to the database name
        label = db.database
      }
      const request = getClient()
        .post(`api/db/${db.resource}`)
        .type('json')
        .send({
          label,
          comment: options.comment,
          prefixes,
          public: options.public,
          schema: options.schema,
        })

      request.pipe(process.stdout)
    }),
  )
export default command
