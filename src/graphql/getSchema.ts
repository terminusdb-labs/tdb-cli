import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql'
import { parseResource } from '../parse.js'

async function getSchema(resource: string[]): Promise<void> {
  const parsedResource = parseResource(resource)
  const path = `api/graphql/${parsedResource.resource}`
  const client = getClient()
  const introspectionQuery = getIntrospectionQuery()
  const response = await client
    .post(path)
    .set('content-Type', 'application/json')
    .send(JSON.stringify({ query: introspectionQuery }))
    .ok((_) => true)
  if (response.status !== 200) {
    console.error(response.body)
    process.exit(1)
  }
  const schema = buildClientSchema(response.body.data)
  console.log(printSchema(schema))
}

const command = new Command()
  .name('get-schema')
  .description('Print the GraphQL schema for the given resource in SDL format')
  .argument('[resource...]', 'the resource to work with')
  .action(getSchema)

export default command
