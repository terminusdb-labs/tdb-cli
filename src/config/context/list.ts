import { Command } from '@commander-js/extra-typings'
import { config } from '../../config.js'
const command = new Command()
  .name('list')
  .description('list all contexts in the configuration file')
  .action(() => {
    const conf = config()
    if (conf === null) {
      console.error('No configuration found')
      process.exit(1)
    }
    for (const context in conf.contexts) {
      if (context === conf.current_context) {
        console.log(`* ${context}`)
      } else {
        console.log(`  ${context}`)
      }
    }
  })
export default command
