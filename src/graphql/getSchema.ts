import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql'

async function getSchema(resource: string | undefined): Promise<void> {
  const resource_ = resource !== null ? `/${resource}` : ''
  const path = `api/graphql${resource_}`
  const client = getClient()
  const introspectionQuery = getIntrospectionQuery()
  const response = await client
    .post(path)
    .ok((_) => true)
    .set('content-Type', 'application/json')
    .send(JSON.stringify({ query: introspectionQuery }))
  if (response.status !== 200) {
    console.error(response.body)
    process.exit(1)
  }
  const schema = buildClientSchema(response.body.data)
  console.log(printSchema(schema))
}

const command = new Command()
  .name('get-schema')
  .argument('<resource>')
  .action(getSchema)

export default command
