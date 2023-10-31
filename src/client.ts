import superagent from 'superagent'
export interface BasicAuth {
  type: 'basic'
  username: string
  password: string
}
export interface TokenAuth {
  type: 'token'
  token: string
}

export interface AnonymousAuth {
  type: 'anonymous'
}

export interface ForwardAuth {
  type: 'forwarded'
  username: string
}

export type Auth = BasicAuth | TokenAuth | AnonymousAuth | ForwardAuth

export interface AuthHeader {
  header: 'Authorization' | 'X-User-Forward'
  content: string
}

function authHeader(auth: Auth): AuthHeader | null {
  switch (auth.type) {
    case 'basic': {
      const decoded = `${auth.username}:${auth.password}`
      const buf = Buffer.from(decoded)
      const encoded = buf.toString('base64')
      return { header: 'Authorization', content: `Basic ${encoded}` }
    }
    case 'token': {
      return { header: 'Authorization', content: `Token ${auth.token}` }
    }
    case 'forwarded': {
      return { header: 'X-User-Forward', content: auth.username }
    }
    case 'anonymous': {
      return null
    }
  }
}

export default class Client {
  serverUrl: string
  auth: Auth

  constructor(serverUrl: string, auth: Auth) {
    this.serverUrl = serverUrl
    this.auth = auth
  }

  url(path: string): string {
    return `${this.serverUrl}/${path}`
  }

  header(): AuthHeader | null {
    return authHeader(this.auth)
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  get(path: string): superagent.SuperAgentRequest {
    const url = this.url(path)
    const header = this.header()
    let request = superagent.get(url)
    if (header !== null) {
      request = request.set(header.header, header.content)
    }

    return request
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  post(path: string): superagent.SuperAgentRequest {
    const url = this.url(path)
    const header = this.header()
    let request = superagent.post(url)
    if (header !== null) {
      request = request.set(header.header, header.content)
    }

    return request
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  put(path: string): superagent.SuperAgentRequest {
    const url = this.url(path)
    const header = this.header()
    let request = superagent.put(url)
    if (header !== null) {
      request = request.set(header.header, header.content)
    }

    return request
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  delete(path: string): superagent.SuperAgentRequest {
    const url = this.url(path)
    const header = this.header()
    let request = superagent.delete(url)
    if (header !== null) {
      request = request.set(header.header, header.content)
    }

    return request
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  patch(path: string): superagent.SuperAgentRequest {
    const url = this.url(path)
    const header = this.header()
    let request = superagent.patch(url)
    if (header !== null) {
      request = request.set(header.header, header.content)
    }

    return request
  }
}
