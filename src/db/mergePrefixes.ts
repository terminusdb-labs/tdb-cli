export default function mergePrefixes(
  dataPrefix: string | undefined,
  schemaPrefix: string | undefined,
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  prefixes: { [key: string]: string } | undefined,
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
): { [key: string]: string } {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  const p: { [key: string]: string } = prefixes ?? {}
  if (!('@base' in p) && dataPrefix !== undefined) {
    p['@base'] = dataPrefix
  }
  if (!('@schema' in p) && schemaPrefix !== undefined) {
    p['@schema'] = schemaPrefix
  }

  return p
}
