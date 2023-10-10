import readLine from 'readline'
import { Command, Option } from '@commander-js/extra-typings'
import { getClient } from '../state.js'

const command = new Command()
  .name('get')
  .description('Retrieve documents')
  .argument('<resource>')
  .addOption(
    new Option('-g, --graph_type <graphType>')
      .choices(['schema', 'instance'])
      .default('instance'),
  )
  .option('-s, --skip <skip>', 'how many documents to skip', parseInt)
  .option('-c, --count <count>', 'how many documents to return', parseInt)
  .option('-m, --no_minimized')
  .option('-l, --as_list')
  .option('-u, --no_unfold')
  .option('-z, --no_compress_ids')
  .option('-i, --id <id>')
  .option('-t, --type <type>')
  .option('--stdin')
  .action(async (resource, options) => {
    const request = getClient()
      .post(`api/document/${resource}`)
      .set('X-HTTP-Method-Override', 'GET')
    const requestOptions: any = {}
    if (options.graph_type !== undefined) {
      requestOptions.graph_type = options.graph_type
    }
    if (options.skip !== undefined) {
      requestOptions.skip = options.skip
    }
    if (options.count !== undefined) {
      requestOptions.count = options.count
    }
    if (options.no_minimized) {
      requestOptions.minimized = false
    }

    if (options.as_list) {
      requestOptions.as_list = true
    }
    if (options.no_unfold) {
      requestOptions.unfold = false
    }
    if (options.no_compress_ids) {
      requestOptions.compress_ids = false
    }
    if (options.id !== undefined) {
      requestOptions.id = options.id
    }
    if (options.type !== undefined) {
      requestOptions.type = options.type
    }
    if (options.stdin) {
      const rl = readLine.createInterface({
        input: process.stdin,
        terminal: false,
      })

      const lines: string[] = []
      for await (const line of rl) {
        lines.push(line)
      }
      requestOptions.ids = lines
    }

    request.send(requestOptions).pipe(process.stdout)
  })

export default command
