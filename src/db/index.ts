import { Command } from '@commander-js/extra-typings'
import create from './create.js'

const command = new Command()
  .name('db')
  .description('database operations')
  .addCommand(create)
export default command
