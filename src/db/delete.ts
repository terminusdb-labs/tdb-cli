import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import { parseDb } from '../parse.js'

const command = new Command()
  .name('delete')
  .description('Delete a database')
  .argument('[database...]', 'the database to work with')
  .option('-f, --force', 'force the deletion of the database (unsafe)', false)
  .action(async (db, options) => {
    const parsedDb = parseDb(db)
    const request = getClient()
      .delete(`api/db/${parsedDb.resource}`)
      .type('json')
      .send({
        force: options.force,
      })

    request.pipe(process.stdout)
  })

export default command
