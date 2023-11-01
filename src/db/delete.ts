import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import parseDb from './parseDb.js'

const command = new Command()
  .name('delete')
  .description('Delete a database')
  .argument('<database>', 'the database to work with', parseDb)
  .option('-f, --force', 'force the deletion of the database (unsafe)', false)
  .action(async (db, options) => {
    const request = getClient()
      .delete(`api/db/${db.resource}`)
      .type('json')
      .send({
        force: options.force,
      })

    request.pipe(process.stdout)
  })

export default command
