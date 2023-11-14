import { Command } from '@commander-js/extra-typings'
import list from './list.js'
import add from './command.js'
const command = new Command()
  .name('endpoint')
  .description('endpoint operations')
  .addCommand(list)
  .addCommand(add)
export default command
