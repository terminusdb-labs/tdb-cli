import { Command } from '@commander-js/extra-typings'
import { config, configPath } from '../../config.js'
import yaml, { type YAMLMap, Pair } from 'yaml'
import fs from 'fs'

const command = new Command()
  .name('add')
  .description('add a new endpoint to the configuration file')
  .argument('<name>', 'the name of the endpoint')
  .argument('<URL>', 'the url for the endpoint')
  .action((name, url) => {
    const conf = config()
    if (conf === null) {
      console.error('No configuration found')
      process.exit(1)
    }
    if (conf.endpoints?.[name] !== undefined) {
      console.error(`endpoint ${name} is already configured`)
      process.exit(1)
    }

    const file = fs.readFileSync(configPath(), 'utf8')
    const toplevel = yaml.parseDocument(file)
    if (toplevel.contents === null) {
      // this is really a brand new file
      // there could be comments though
      const map: Record<string, string> = {}
      map[name] = url
      const node = toplevel.createNode({ endpoints: map }) as YAMLMap.Parsed
      toplevel.contents = node
    } else {
      const parsed = toplevel.contents as YAMLMap
      const endpoints = parsed.get('endpoints', true) as YAMLMap | undefined
      if (endpoints === undefined) {
        // this is our very first endpoint!
        // endpoints canonically go at the top of the file
        const map: Record<string, string> = {}
        map[name] = url
        parsed.items.unshift(new Pair('endpoints', map))
      } else {
        // there's already some other endpoints in here so add it to the end
        endpoints.items.push(new Pair(name, url))
      }
    }
    const result = String(toplevel)
    fs.writeFileSync(configPath(), result)
  })
export default command
