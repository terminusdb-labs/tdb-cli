import { Command } from '@commander-js/extra-typings'
import create from './create.js'
import delete_ from './delete.js'

const command = new Command()
  .name('db')
  .description('database operations')
  .addCommand(create)
  .addCommand(delete_)
export default command
