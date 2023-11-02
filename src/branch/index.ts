import { Command } from '@commander-js/extra-typings'
import list from './list.js'
import create from './create.js'
import delete_ from './delete.js'

const command = new Command()
  .name('branch')
  .description('branch operations')
  .addCommand(list)
  .addCommand(create)
  .addCommand(delete_)

export default command
