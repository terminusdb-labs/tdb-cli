import { Command } from '@commander-js/extra-typings'
import getDoc from './getDoc.js'

const command = new Command().name('doc').addCommand(getDoc)
export default command
