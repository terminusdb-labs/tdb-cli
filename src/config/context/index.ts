import { Command } from '@commander-js/extra-typings'
import list from './list.js'
import switch_ from './switch.js'
const command = new Command()
  .name('context')
  .description('context operations')
  .addCommand(list)
  .addCommand(switch_)
export default command
