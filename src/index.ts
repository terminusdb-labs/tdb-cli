#!/usr/bin/env node
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'

import doc from './doc/index.js'
import Client from './client.js'
import Config from './config.js'
import { type CliArgs } from './config.js'

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
  {
    name: 'token',
    type: String,
  },
  {
    name: 'context',
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

function generateUsage(): void {
  const usage = commandLineUsage(sections)
  console.log(usage)
}

const options = commandLineArgs(optionDefinitions, { stopAtFirstUnknown: true })
const conf = Config.defaultContext(options as CliArgs)
if (conf === null) {
  console.error('no config available')
  process.exit(1)
}
const client = new Client(conf.endpoint, conf.credentials)
if (options.command === 'doc') {
  await doc(client, options._unknown ?? [])
} else {
  generateUsage()
}
