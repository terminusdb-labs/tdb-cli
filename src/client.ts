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

export type Auth = BasicAuth | TokenAuth

function authHeader(auth: Auth): string {
  switch (auth.type) {
    case 'basic': {
      const decoded = `${auth.username}:${auth.password}`
      const buf = Buffer.from(decoded)
      const encoded = buf.toString('base64')
      return `Basic ${encoded}`
    }
    case 'token': {
      return `Token ${auth.token}`
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

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  get(path: string): superagent.SuperAgentRequest {
    const url = this.url(path)
    return superagent.get(url).set('Authorization', authHeader(this.auth))
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  post(path: string): superagent.SuperAgentRequest {
    const url = this.url(path)
    return superagent.post(url).set('Authorization', authHeader(this.auth))
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  put(path: string): superagent.SuperAgentRequest {
    const url = this.url(path)
    return superagent.put(url).set('Authorization', authHeader(this.auth))
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  delete(path: string): superagent.SuperAgentRequest {
    const url = this.url(path)
    return superagent.delete(url).set('Authorization', authHeader(this.auth))
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  patch(path: string): superagent.SuperAgentRequest {
    const url = this.url(path)
    return superagent.patch(url).set('Authorization', authHeader(this.auth))
  }
}
