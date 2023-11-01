import { InvalidArgumentError } from '@commander-js/extra-typings'
import parseResource from '../resource.js'
export default function parseDb(s: string): {
  organization: string
  database: string
  resource: string
} {
  // this is a little bit silly but it ensures a common code path
  const resource = parseResource(s)
  const m = resource.match(/^([^/]+)\/([^/]+)$/)
  if (m === null) {
    throw new InvalidArgumentError(`${s} does not refer to a database`)
  }
  const organization = m[1]
  const database = m[2]

  return {
    organization,
    database,
    resource,
  }
}
