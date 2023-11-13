import os from 'os'
import fs from 'fs'
import yaml from 'js-yaml'
import { type Auth } from './client.js'

function configPath(): string {
  return process.env.TDB_CLI_CONFIG_PATH ?? os.homedir() + '/.tdb.yml'
}

let _config: unknown | null = null
function config(): any {
  if (_config !== null) {
    return _config
  }
  const file = fs.readFileSync(configPath(), 'utf8')
  _config = yaml.load(file)

  return _config
}

export interface RuntimeContext {
  endpoint: string
  credentials: Auth
  organization?: string
  database?: string
  branch?: string
}

export interface CliArgs {
  server?: string
  username?: string
  password?: string
  token?: string
  context?: string
  organization?: string
}

export default {
  defaultConfigContext(): RuntimeContext | null {
    const name = config().current_context
    if (name !== undefined) {
      return this.context(name)
    }
    return null
  },

  cliContext(
    orig: RuntimeContext | null,
    args: CliArgs,
  ): RuntimeContext | null {
    let auth: Auth | null = orig?.credentials ?? null
    if (args.username !== undefined && args.password !== undefined) {
      auth = { type: 'basic', username: args.username, password: args.password }
    } else if (args.token !== undefined) {
      auth = { type: 'token', token: args.token }
    }
    const endpoint = args.server ?? orig?.endpoint ?? null
    const organization = args.organization ?? orig?.organization ?? undefined

    if (auth !== null && endpoint !== null) {
      return {
        endpoint,
        credentials: auth,
        organization,
      }
    }

    return null
  },

  envContext(orig: RuntimeContext | null): RuntimeContext | null {
    let auth: Auth | null = orig?.credentials ?? null
    const tdbUser = process.env.TDB_USER
    const tdbPassword = process.env.TDB_PASSWORD
    const tdbToken = process.env.TDB_TOKEN
    const tdbServer = process.env.TDB_SERVER
    const tdbOrganization = process.env.TDB_ORGANIZATION
    if (tdbUser !== undefined && tdbPassword !== undefined) {
      auth = { type: 'basic', username: tdbUser, password: tdbPassword }
    } else if (tdbToken !== undefined) {
      auth = { type: 'token', token: tdbToken }
    }
    if (auth !== null && tdbServer !== undefined) {
      return {
        endpoint: tdbServer,
        credentials: auth,
        organization: tdbOrganization,
      }
    }
    if (orig !== null && (auth !== null || tdbServer !== undefined)) {
      return {
        endpoint: tdbServer ?? orig.endpoint,
        credentials: auth ?? orig.credentials,
        organization: tdbOrganization ?? orig.organization,
      }
    }

    return null
  },

  defaultContext(args: CliArgs): RuntimeContext | null {
    let file
    if (args.context !== undefined) {
      file = this.context(args.context)
    } else {
      file = this.defaultConfigContext()
    }
    return this.cliContext(file, args) ?? this.envContext(file) ?? file
  },

  context(name: string): RuntimeContext | null {
    const c = config()
    const context = c.contexts[name]
    if (context !== undefined) {
      let credentials: Auth
      // anonymous is a type of credential that has no further configuration options
      // as such, it makes no sense to declare it. We just assume its
      // existence rather than looking it up.
      if (context.credentials === 'anonymous') {
        credentials = { type: 'anonymous' }
      } else {
        credentials = c.credentials[context.credentials]
      }
      let endpoint = c.endpoints[context.endpoint]
      if (credentials !== undefined && endpoint !== undefined) {
        if (context.team !== undefined) {
          endpoint = `${endpoint}/${context.team}`
        }
        const organization = context.organization
        return {
          endpoint,
          credentials,
          organization,
        }
      }
    }

    return null
  },
}
