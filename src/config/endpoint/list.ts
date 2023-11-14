import { Command } from '@commander-js/extra-typings'
import { config } from '../../config.js'
const command = new Command()
  .name('list')
  .description('list all endpoints in the configuration file')
  .action(() => {
    const conf = config()
    if (conf === null) {
      console.error('No configuration found')
      process.exit(1)
    }
    for (const endpoint in conf.endpoints) {
      console.log(`${endpoint}: ${conf.endpoints[endpoint]}`)
    }
  })
export default command
