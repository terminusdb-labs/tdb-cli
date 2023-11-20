#!/usr/bin/env node
import { program } from '@commander-js/extra-typings'

import doc from './doc/index.js'
import db from './db/index.js'
import branch from './branch/index.js'
import log from './log.js'
import graphql from './graphql/index.js'
import curl from './curl.js'
import config from './config/index.js'
import setup from './setup.js'
import user from './user/index.js'
import Client from './client.js'
import Config, { ConfigurationFileError } from './config.js'
import { setClient, setContext } from './state.js'

program
  .enablePositionalOptions(true)
  .hook('preSubcommand', (command) => {
    // the init config command do not need any setup. everything else does
    const noconfig = ['config', 'setup']
    if (command.args.length === 0 || !noconfig.includes(command.args[0])) {
      const opts = command.opts()
      let conf
      try {
        conf = Config.defaultContext(opts)
      } catch (e) {
        if (e instanceof ConfigurationFileError) {
          console.error(e.message)
          process.exit(1)
        }
        throw e
      }
      if (conf === null) {
        console.error('no config available')
        process.exit(1)
      }
      setContext(conf)
      setClient(new Client(conf.endpoint, conf.credentials))
    }
  })
  .option('-s, --server <serverUrl>', 'TerminusDB endpoint')
  .option('-u, --username <username>', 'Username (for authentication)')
  .option('-p, --password <password>', 'Password (for authentication)')
  .option('-t, --token <token>', 'Token (for authentication)')
  .option(
    '-o, --organization <organization>',
    'Organization to default to when looking up resource strings',
  )
  .option(
    '-c, --context <context>',
    'Which context from the configuration to use',
  )
  .addCommand(doc)
  .addCommand(db)
  .addCommand(branch)
  .addCommand(graphql)
  .addCommand(log)
  .addCommand(curl)
  .addCommand(config)
  .addCommand(setup)
  .addCommand(user)
await program.parseAsync()
