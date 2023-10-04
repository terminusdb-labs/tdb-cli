#!/usr/bin/env node
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'

import doc from './doc/index.js'
import Client from './client.js'

const optionDefinitions = [
  { name: 'command', defaultOption: true },
  {
    name: 'server',
    type: String,
  },
  {
    name: 'username',
    type: String,
  },
  {
    name: 'password',
    type: String,
  },
]
const commands = [
  { name: 'help', summary: 'Display help information.' },
  { name: 'doc', summary: 'Interact with documents.' },
]

const sections = [
  {
    header: 'TerminusDB CLI',
    content: 'Interact with a remote TerminusDB instance.',
  },
  {
    header: 'Common Options',
    optionList: optionDefinitions,
    hide: ['command'],
  },
  {
    header: 'Command List',
    content: commands,
  },
]

function generateUsage (): void {
  const usage = commandLineUsage(sections)
  console.log(usage)
}

const options = commandLineArgs(optionDefinitions, { stopAtFirstUnknown: true })
const client = new Client(options.server ?? 'http://127.0.0.1:6363', { type: 'basic', username: options.username ?? 'admin', password: options.password ?? 'root' })
if (options.command === 'doc') {
  await doc(client, options._unknown ?? [])
} else {
  generateUsage()
}
