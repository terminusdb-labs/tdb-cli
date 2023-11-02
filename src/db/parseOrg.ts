import { InvalidArgumentError } from '@commander-js/extra-typings'
export default function parseOrg(s: string): string {
  // this is a little bit silly but it ensures a common code path
  if (s.includes('/')) {
    throw new InvalidArgumentError(`${s} does not refer to an organization`)
  }

  return s
}
