import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'

import getDoc from './getDoc.js'
import type Client from '../client.js'

const optionDefinitions = [{ name: 'command', defaultOption: true }]

const commands = [
  { name: 'get', summary: 'Retrieve documents.' },
  { name: 'insert', summary: 'Insert documents.' },
  { name: 'replace', summary: 'Replace documents.' },
  { name: 'delete', summary: 'Delete documents.' },
  { name: 'help', summary: 'Show help.' },
]

const sections = [
  {
    header: 'TerminusDB Document API',
    content: 'Get, insert, replace and delete documents from TerminusDB',
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

export default async function handle(
  client: Client,
  argv: string[],
): Promise<void> {
  const options = commandLineArgs(optionDefinitions, {
    argv,
    stopAtFirstUnknown: true,
  })
  if (options.command === 'get') {
    await getDoc(client, options._unknown ?? [])
  } else {
    generateUsage()
  }
}
