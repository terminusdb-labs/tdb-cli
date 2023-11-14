import { Command } from '@commander-js/extra-typings'
import list from './list.js'
const command = new Command()
  .name('context')
  .description('context operations')
  .addCommand(list)
export default command
