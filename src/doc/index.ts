import { Command } from '@commander-js/extra-typings'
import getDoc from './getDoc.js'

export function command(name: string): Command {
  return new Command().name(name).addCommand(getDoc)
}
