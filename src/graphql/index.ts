import { Command } from '@commander-js/extra-typings'

import getSchema from './getSchema.js'

const command = new Command()
  .name('graphql')
  .description('GraphQL utilities')
  .addCommand(getSchema)

export default command
