import { Command } from '@commander-js/extra-typings'
import getDoc from './getDoc.js'
import insertDoc from './insertDoc.js'

const command = new Command()
  .name('doc')
  .description('Work with TerminusDB documents')
  .addCommand(getDoc)
  .addCommand(insertDoc)
export default command
