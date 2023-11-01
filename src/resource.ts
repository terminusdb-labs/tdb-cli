import { getOrganization } from './state.js'

/**
 * calculate a resource string from something that is either a resource string or a bare name
 */
export default function resource(spec: string): string {
  // todo make use of commander exception types to do some good validations
  if (spec.startsWith('_') || spec.includes('/')) {
    // this is already in resource string format
    return spec
  }
  // assume this is a bare database name
  const org = getOrganization()
  return `${org}/${spec}`
}
