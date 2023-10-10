#!/usr/bin/env node
import { program } from '@commander-js/extra-typings'

import doc from './doc/index.js'
import graphql from './graphql/index.js'
import Client from './client.js'
import Config from './config.js'
import { setClient } from './state.js'

program
  .enablePositionalOptions(true)
  .option('-s, --server <serverUrl>', 'TerminusDB endpoint')
  .option('-u, --username <username>', 'Username (for authentication)')
  .option('-p, --password <password>', 'Password (for authentication)')
  .option('-t, --token <token>', 'Token (for authentication)')
  .option(
    '-c, --context <context>',
    'Which context from the configuration to use',
  )
  .hook('preAction', (command) => {
    const opts = command.opts()
    const conf = Config.defaultContext(opts)
    if (conf === null) {
      console.error('no config available')
      process.exit(1)
    }
    setClient(new Client(conf.endpoint, conf.credentials))
  })
  .addCommand(doc)
  .addCommand(graphql)
await program.parseAsync()
