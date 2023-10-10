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
