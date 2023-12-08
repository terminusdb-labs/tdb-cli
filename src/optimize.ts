import { Command } from '@commander-js/extra-typings'
import { getClient } from './state.js'
import { withParsedResource } from './parse.js'

const command = new Command()
  .name('optimize')
  .description('optimize a resource')
  .argument('[resource...]', 'the resource to optimize')
  .action(
    withParsedResource(async (resource) => {
      const request = getClient()
        .post(`api/optimize/${resource.resource}`)
        .ok((_) => true)

      const response = await request
      switch (response.status) {
        case 200:
          break
        case 401:
      }
      if (response.status === 200) {
        console.log('resource optimized.')
      } else {
        if (typeof response.body === 'object') {
          const body = response.body as { 'api:message'?: string }
          if (body['api:message'] !== undefined) {
            console.error(body['api:message'])
            process.exit(1)
          }
        }
        // something went wrong but it didn't go wrong in a way that gives us an easy message
        console.error(`Optimize returned status ${response.status}`)
        console.error(response.body)
        process.exit(1)
      }
    }),
  )

export default command
