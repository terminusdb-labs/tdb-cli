import { Command } from '@commander-js/extra-typings'
import context from './context/index.js'
import endpoint from './endpoint/index.js'
const command = new Command()
  .name('config')
  .description('configuration operations')
  .addCommand(context)
  .addCommand(endpoint)
export default command
