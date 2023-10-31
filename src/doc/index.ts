import { Command } from '@commander-js/extra-typings'
import getDoc from './getDoc.js'
import insertDoc from './insertDoc.js'
import deleteDoc from './deleteDoc.js'
import replaceDoc from './replaceDoc.js'

const command = new Command()
  .name('doc')
  .description('Work with TerminusDB documents')
  .addCommand(getDoc)
  .addCommand(insertDoc)
  .addCommand(deleteDoc)
  .addCommand(replaceDoc)
export default command
