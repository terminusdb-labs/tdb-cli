import type Client from './client.js'

let _client: Client | null = null
export function getClient(): Client {
  if (_client === null) {
    console.error('no client set up')
    process.exit(1)
  }
  return _client
}

export function setClient(client: Client): void {
  _client = client
}

let _organization: string | null = null
export function getOrganization(): string {
  return _organization ?? 'admin'
}

export function setOrganization(organization: string | null): void {
  _organization = organization
}
