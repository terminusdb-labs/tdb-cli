import { Command } from '@commander-js/extra-typings'
import { config, configPath } from '../../config.js'
import yaml, { type YAMLMap } from 'yaml'
import fs from 'fs'

const command = new Command()
  .name('switch')
  .description('switch current context')
  .argument('<name>', 'the name of the context')
  .action((name, url) => {
    const conf = config()
    if (conf === null) {
      console.error(
        "No configuration found. Please initialize one first with 'tdb-cli setup'",
      )
      process.exit(1)
    }
    if (conf.current_context === name) {
      console.log(`context is already set to ${name}`)
      return
    }

    if (conf.contexts?.[name] === undefined) {
      console.error(`context '${name}' not found in configuration`)
      process.exit(1)
    }

    const file = fs.readFileSync(configPath(), 'utf8')
    const toplevel = yaml.parseDocument(file)
    const contents = toplevel.contents as YAMLMap

    contents.set('current_context', name)

    const result = String(toplevel)
    fs.writeFileSync(configPath(), result)

    console.log(`Switched active context to ${name}`)
  })
export default command
