import commandLineArgs, { type OptionDefinition } from 'command-line-args'
import type Client from '../client.js'
import commandLineUsage from 'command-line-usage'
import readLine from 'readline'

const optionDefinitions: OptionDefinition[] = [
  {
    name: 'help',
    type: Boolean,
  },
  {
    name: 'resource',
    defaultOption: true,
  },
  {
    name: 'graph_type',
    type: String,
    alias: 'g',
  },
  {
    name: 'skip',
    type: Number,
    alias: 's',
  },
  {
    name: 'count',
    type: Number,
    alias: 'c',
  },
  {
    name: 'no_minimized',
    type: Boolean,
    alias: 'm',
  },
  {
    name: 'as_list',
    type: Boolean,
    alias: 'l',
  },
  {
    name: 'no_unfold',
    type: Boolean,
    alias: 'u',
  },
  {
    name: 'no_compress_ids',
    type: Boolean,
    alias: 'z',
  },
  {
    name: 'id',
    type: String,
    alias: 'i',
  },
  {
    name: 'type',
    type: String,
    alias: 't',
  },
  {
    name: 'stdin',
    type: Boolean,
  },
]

interface GetOptions {
  help: boolean
  resource: string
  graph_type: string | undefined
  skip: number | undefined
  count: number | undefined
  no_minimized: boolean
  as_list: boolean
  no_unfold: boolean
  no_compress_ids: boolean

  id: string | undefined
  type: string | undefined

  stdin: boolean
}

const sections = [
  {
    header: 'TerminusDB Document GET',
    content: ['Get documents from TerminusDB',
      '',
      'usage: tdb-cli doc get [options] <resource path>'],
  },
  {
    header: 'Options',
    optionList: optionDefinitions,
    hide: ['resource'],
  },
]

function generateUsage (): void {
  const usage = commandLineUsage(sections)
  console.log(usage)
}

export default async function getDoc (client: Client, argv: string[]): Promise<void> {
  const options = commandLineArgs(optionDefinitions, { argv }) as GetOptions
  if (options.help) {
    generateUsage(); return
  }

  const request = client.post(`api/document/${options.resource}`).set('X-HTTP-Method-Override', 'GET')
  const requestOptions: any = {}
  if (options.graph_type !== undefined) {
    requestOptions.graph_type = options.graph_type
  }
  if (options.skip !== undefined) {
    requestOptions.skip = options.skip
  }
  if (options.count !== undefined) {
    requestOptions.count = options.count
  }
  if (options.no_minimized) {
    requestOptions.minimized = false
  }

  if (options.as_list) {
    requestOptions.as_list = true
  }
  if (options.no_unfold) {
    requestOptions.unfold = false
  }
  if (options.no_compress_ids) {
    requestOptions.compress_ids = false
  }
  if (options.id !== undefined) {
    requestOptions.id = options.id
  }
  if (options.type !== undefined) {
    requestOptions.type = options.type
  }
  if (options.stdin) {
    const rl = readLine.createInterface({
      input: process.stdin,
      terminal: false,
    })

    const lines: string[] = []
    for await (const line of rl) {
      lines.push(line)
    }
    requestOptions.ids = lines
  }

  request.send(requestOptions)
    .pipe(process.stdout)
}
