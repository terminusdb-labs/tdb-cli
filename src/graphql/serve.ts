import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import express from 'express'
import Mustache from 'mustache'
import { readFile } from 'fs/promises'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import open from 'open'
import getPort from 'get-port'
const dir = dirname(fileURLToPath(import.meta.url))
const template = await readFile(dir + '/../../assets/graphiql.tpl', 'utf8')

async function serve(
  resource: string | undefined,
  opts: { port: number; open?: boolean },
): Promise<void> {
  const client = getClient()

  const app = express()
  app.get('/*', (req, res) => {
    const path = `api/graphql${req.path}`
    // TODO do something cooler with server side react rendering or something
    const response = Mustache.render(template, {
      url: client.url(path),
      auth: client.header(),
    })
    res.send(response)
  })

  const port = await getPort({ port: opts.port })
  app.listen(port)
  const localResource = '/' + resource ?? ''
  console.log(
    `Hosting a GraphiQL endpoint at http://localhost:${port}${localResource}`,
  )
  if (opts.open ?? false) {
    await open(`http://localhost:${port}${localResource}`)
  }
}

const command = new Command()
  .name('serve')
  .argument('[resource]')
  .option('-p, --port <port>', 'The port to host graphiql on', parseInt, 3003)
  .option('-o, --open', 'Open a browser')
  .action(serve)

export default command
