#!/usr/bin/env node
import { program } from '@commander-js/extra-typings'

import * as doc from './doc/index.js'
import Client from './client.js'
import Config from './config.js'
import { setClient } from './state.js'

program
  .enablePositionalOptions(true)
  .option('-s, --server <serverUrl>')
  .option('-u, --username <username>')
  .option('-p, --password <password>')
  .option('-t, --token <token>')
  .option('-c, --context <context>')
  .hook('preAction', (command) => {
    const opts = command.opts()
    const conf = Config.defaultContext(opts)
    if (conf === null) {
      console.error('no config available')
      process.exit(1)
    }
    setClient(new Client(conf.endpoint, conf.credentials))
  })
  .addCommand(doc.command('doc'))
await program.parseAsync()
