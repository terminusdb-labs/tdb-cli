import { Command } from '@commander-js/extra-typings'
import setPassword from './setPassword.js'

const command = new Command()
  .name('user')
  .description('user operations')
  .addCommand(setPassword)
export default command
