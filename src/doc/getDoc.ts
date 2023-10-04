import commandLineArgs, { OptionDefinition } from 'command-line-args'
import Client from '../client.js'
import commandLineUsage from 'command-line-usage'

const optionDefinitions: OptionDefinition[] = [
  {
    name: 'help',
    type: Boolean
  },
  {
    name: 'resource',
    defaultOption: true,
  }
]

interface GetOptions {
  help: boolean
  resource: string
}

const sections = [
  {
    header: 'TerminusDB Document GET',
    content: ['Get documents from TerminusDB',
      '',
      'usage: tdb-cli doc get [options] <resource path>']
  },
  {
    header: 'Options',
    optionList: optionDefinitions,
    hide: ['resource']
  }
]

function generateUsage (): void {
  const usage = commandLineUsage(sections)
  console.log(usage)
}


export default async function getDoc (client: Client, argv: string[]): Promise<void> {
  const options = commandLineArgs(optionDefinitions, { argv }) as GetOptions
  if (options.help) {
    return generateUsage();
  }
  
  const result = await client.get(`api/document/${options.resource}?as_list=true`)
  console.log(result)
}
