import { Command } from '@commander-js/extra-typings'
import create from './create.js'
import delete_ from './delete.js'
import list from './list.js'
import info from './info.js'
import update from './update.js'

const command = new Command()
  .name('db')
  .description('database operations')
  .addCommand(list)
  .addCommand(info)
  .addCommand(create)
  .addCommand(delete_)
  .addCommand(update)
export default command
