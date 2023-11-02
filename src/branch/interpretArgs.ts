import parseDb from '../db/parseDb.js'
import resource from '../resource.js'

export default function interpretArgs(
  spec: string,
  branch: string | undefined,
): string {
  if (branch === undefined) {
    return resource(spec)
  }

  const db = parseDb(spec)
  return db.resource + '/local/branch/' + branch
}
