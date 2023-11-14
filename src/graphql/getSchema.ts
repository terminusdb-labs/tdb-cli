import { Command } from '@commander-js/extra-typings'
import { getClient } from '../state.js'
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql'
import { type ParsedResource, withParsedResource } from '../parse.js'

async function getSchema(resource: ParsedResource): Promise<void> {
  const path = `api/graphql/${resource.resource}`
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
  .action(withParsedResource(getSchema))

export default command
