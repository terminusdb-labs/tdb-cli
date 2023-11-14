import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import { withParsedDb } from '../parse.js'

const command = new Command()
  .name('update')
  .description('Update a database')
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
      // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
      let prefixes: { [key: string]: string } | undefined
      if (options.prefixes !== undefined) {
        // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
        prefixes = options.prefixes as unknown as { [key: string]: string }
        if (!('@base' in prefixes) && options.dataPrefix !== undefined) {
          prefixes['@base'] = options.dataPrefix
        }
        if (!('@schema' in prefixes) && options.schemaPrefix !== undefined) {
          prefixes['@schema'] = options.schemaPrefix
        }
      }
      const request = getClient()
        .put(`api/db/${db.resource}`)
        .type('json')
        .send({
          label: options.label,
          comment: options.comment,
          public: options.public,
          schema: options.schema,
          prefixes,
        })

      request.pipe(process.stdout)
    }),
  )

export default command
