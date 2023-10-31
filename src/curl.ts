import { Command } from '@commander-js/extra-typings'
import { getClient } from './state.js'

import { spawnSync, spawn } from 'child_process'

const command = new Command()
  .name('curl')
  .description('Run a curl command against the server in the active context.')
  .argument('<api>', 'API endpoint curl should connect to.')
  .argument('[arguments...]', 'arguments to curl')
  .option('-e, --echo', 'echo the curl command rather than running it')
  .allowUnknownOption(true)
  .addHelpText(
    'after',
    `
Example: tdb-cli curl 'api/document/someOrg/someDb?raw_json=true' -X POST

Note that unlike plain curl, the api has to go first (as this tool needs to transform this to a full  URL.
If you wish to see what curl command will be run by this command, instead of actually running it, -e will show the command. If you wish to pass -e (or --help) to the underlying curl instead, use -- as the first argument to prevent tdb-cli from consuming this option.
`,
  )
  .action(async (api, args, options) => {
    const client = getClient()
    const url = client.url(api)
    const auth = client.header()
    let authCliPart
    if (auth === null) {
      authCliPart = ''
    } else {
      authCliPart = `-H "${auth.header}: ${auth.content}" `
    }

    const c = `curl ${authCliPart}"${url}" ${args.join(' ')}`.trimEnd()

    if (options.echo === true) {
      console.log(c)
    } else {
      spawnSync('sh', ['-c', c], {
        stdio: 'inherit',
      })
    }
  })

export default command
