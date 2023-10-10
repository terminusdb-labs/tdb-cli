import { Command } from '@commander-js/extra-typings'

import getSchema from './getSchema.js'
import serve from './serve.js'

const command = new Command()
  .name('graphql')
  .description('GraphQL utilities')
  .addCommand(getSchema)
  .addCommand(serve)

export default command
