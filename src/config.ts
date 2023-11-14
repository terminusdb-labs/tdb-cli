import os from 'os'
import fs from 'fs'
import yaml, { YAMLParseError } from 'yaml'

export function configPath(): string {
  return process.env.TDB_CLI_CONFIG_PATH ?? os.homedir() + '/.tdb.yml'
}

export class ConfigurationFileError extends Error {}

interface HasCode {
  code: string | undefined
}

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

export interface ContextConfig {
  endpoint: string
  credentials: string
  team?: string
  organization?: string
  database?: string
  branch?: string
}

interface ValidatedConfig {
  endpoints?: Record<string, string | undefined>
  credentials?: Record<string, Auth | undefined>
  contexts?: Record<string, ContextConfig>
  current_context?: string
}

let _config: ValidatedConfig | null | undefined
export function config(): ValidatedConfig | null {
  if (_config !== undefined) {
    return _config
  }
  _config = null
  try {
    const file = fs.readFileSync(configPath(), 'utf8')
    const parsedConfig = yaml.parse(file)
    _config = validateConfig(parsedConfig)
  } catch (e) {
    // two things could have gone wrong here. either the file didn't
    // exist or it wasn't a proper yaml file not existing is ok. There
    // is a chance enough context is given using CLI.  But a parse
    // error should be reported immediately.
    if (e instanceof YAMLParseError) {
      console.error(
        `You have an error in your configuration file (${configPath()}):`,
      )
      console.error(e.message)
      process.exit(1)
    } else if ((e as HasCode).code !== 'ENOENT') {
      throw e
    }
  }

  return _config
}

interface UnvalidatedConfig {
  endpoints?: unknown
  credentials?: unknown
  contexts?: unknown
  current_context?: unknown
}

const _expectedConfigFields = [
  'endpoints',
  'credentials',
  'contexts',
  'current_context',
]
function validateConfig(config: unknown): ValidatedConfig {
  if (config === null) {
    return {}
  }
  if (config instanceof Object) {
    for (const key in config) {
      if (!_expectedConfigFields.includes(key)) {
        throw new ConfigurationFileError(
          `unknown field in configuration: '${key}'`,
        )
      }
    }
    const unvalidated = config as UnvalidatedConfig
    if (unvalidated.endpoints !== undefined) {
      validateEndpoints(unvalidated.endpoints)
    }
    if (unvalidated.credentials !== undefined) {
      validateCredentials(unvalidated.credentials)
    }
    if (unvalidated.contexts !== undefined) {
      validateContexts(
        unvalidated.contexts,
        unvalidated.endpoints as Record<string, string>,
        unvalidated.credentials as Record<string, Auth>,
      )
    }

    if (unvalidated.current_context !== undefined) {
      if (typeof unvalidated.current_context !== 'string') {
        throw new ConfigurationFileError(
          'current_context in configuration is not a string',
        )
      }
      const contexts = unvalidated.contexts as Record<string, unknown>
      if (contexts[unvalidated.current_context] === undefined) {
        throw new ConfigurationFileError(
          `configured current_context points at '${unvalidated.current_context}', but no such context was configured`,
        )
      }
    }

    return config as ValidatedConfig
  }
  throw new ConfigurationFileError('configuration file malformatted')
}

function validateEndpoints(endpoints: unknown): void {
  if (endpoints instanceof Object) {
    const unvalidated = endpoints as Record<string, unknown>
    for (const key in unvalidated) {
      const value = unvalidated[key]
      if (typeof value !== 'string') {
        throw new ConfigurationFileError(
          `endpoint '${key}' is not set as a string`,
        )
      }
    }
  } else {
    throw new ConfigurationFileError('endpoints malformatted')
  }
}

function validateCredentials(credentials: unknown): void {
  if (credentials instanceof Object) {
    const unvalidated = credentials as Record<string, unknown>
    for (const name in credentials) {
      validateSingleCredentials(name, unvalidated[name])
    }
  }
}

function validateSingleCredentials(name: string, credentials: unknown): void {
  if (!(credentials instanceof Object)) {
    throw new ConfigurationFileError(`credentials '${name}' is malformed`)
  }

  const unvalidated = credentials as Record<string, unknown>
  const typ = unvalidated.type
  if (typ === undefined) {
    throw new ConfigurationFileError(`credentials '${name}' lacks a type`)
  } else if (typeof typ !== 'string') {
    throw new ConfigurationFileError(
      `type for credentials '${name}' is not a string`,
    )
  } else {
    switch (typ) {
      case 'anonymous':
        validateAnonymousCredentials(name, unvalidated)
        break
      case 'forwarded':
        validateForwardedCredentials(name, unvalidated)
        break
      case 'token':
        validateTokenCredentials(name, unvalidated)
        break
      case 'basic':
        validateBasicCredentials(name, unvalidated)
        break
      default:
        throw new ConfigurationFileError(
          `unknown credentials type for '${name}': ${typ}`,
        )
    }
  }
}

function validateAnonymousCredentials(
  name: string,
  credentials: Record<string, unknown>,
): void {
  const keys = Object.keys(credentials)
  if (keys.length > 1) {
    const unrecognized = keys.filter((v) => v !== 'type').join(', ')
    throw new ConfigurationFileError(
      `unrecognized fields in credentials '${name}': ${unrecognized}`,
    )
  }
}

function validateForwardedCredentials(
  name: string,
  credentials: Record<string, unknown>,
): void {
  const keys = Object.keys(credentials)
  if (credentials.username === undefined) {
    throw new ConfigurationFileError(
      `missing field 'username' for credentials '${name}'`,
    )
  }
  if (keys.length > 2) {
    const unrecognized = keys
      .filter((v) => v !== 'type' && v !== 'username')
      .join(', ')
    throw new ConfigurationFileError(
      `unrecognized fields in credentials '${name}': ${unrecognized}`,
    )
  }
}

function validateTokenCredentials(
  name: string,
  credentials: Record<string, unknown>,
): void {
  const keys = Object.keys(credentials)
  if (credentials.token === undefined) {
    throw new ConfigurationFileError(
      `missing field 'token' for credentials '${name}'`,
    )
  }
  if (keys.length > 2) {
    const unrecognized = keys
      .filter((v) => v !== 'type' && v !== 'token')
      .join(', ')
    throw new ConfigurationFileError(
      `unrecognized fields in credentials '${name}': ${unrecognized}`,
    )
  }
}

function validateBasicCredentials(
  name: string,
  credentials: Record<string, unknown>,
): void {
  const keys = Object.keys(credentials)
  if (credentials.username === undefined) {
    throw new ConfigurationFileError(
      `missing field 'username' for credentials '${name}'`,
    )
  }
  if (credentials.password === undefined) {
    throw new ConfigurationFileError(
      `missing field 'password' for credentials '${name}'`,
    )
  }
  if (keys.length > 3) {
    const unrecognized = keys
      .filter((v) => v !== 'type' && v !== 'username' && v !== 'password')
      .join(', ')
    throw new ConfigurationFileError(
      `unrecognized fields in credentials '${name}': ${unrecognized}`,
    )
  }
}

function validateContexts(
  contexts: unknown,
  endpoints: Record<string, string>,
  credentials: Record<string, Auth>,
): void {
  if (!(contexts instanceof Object)) {
    throw new ConfigurationFileError(
      'malformed contexts field in configuration file',
    )
  }
  const unvalidatedContexts = contexts as Record<string, unknown>

  for (const name in unvalidatedContexts) {
    validateSingleContext(
      name,
      unvalidatedContexts[name],
      endpoints,
      credentials,
    )
  }
}

interface UnvalidatedContext {
  endpoint: unknown
  credentials: unknown
  team: unknown
  organization: unknown
  database: unknown
  branch: unknown
}

const _allowedContextFields = [
  'endpoint',
  'credentials',
  'team',
  'organization',
  'database',
  'branch',
]
function validateSingleContext(
  name: string,
  context: unknown,
  endpoints: Record<string, string>,
  credentials: Record<string, Auth>,
): void {
  if (!(context instanceof Object)) {
    throw new ConfigurationFileError(
      `malformed context ${name} in configuration file`,
    )
  }
  for (const key in context) {
    if (!_allowedContextFields.includes(key)) {
      throw new ConfigurationFileError(
        `context ${name} has unknown field: '${key}'`,
      )
    }
  }
  const unvalidated = context as UnvalidatedContext

  if (unvalidated.endpoint === undefined) {
    throw new ConfigurationFileError(
      `context ${name} does not contain a field 'endpoint'`,
    )
  } else if (typeof unvalidated.endpoint !== 'string') {
    throw new ConfigurationFileError(
      `context ${name} contains an endpoint that is not a string`,
    )
  } else if (endpoints?.[unvalidated.endpoint] === undefined) {
    throw new ConfigurationFileError(
      `context ${name} refers to endpoint '${unvalidated.endpoint}', but no such endpoint was configured`,
    )
  }

  if (unvalidated.credentials === undefined) {
    throw new ConfigurationFileError(
      `context ${name} does not contain a field 'credentials'`,
    )
  } else if (typeof unvalidated.credentials !== 'string') {
    throw new ConfigurationFileError(
      `context ${name} contains an credentials that is not a string`,
    )
  } else if (
    unvalidated.credentials !== 'anonymous' &&
    credentials[unvalidated.credentials] === undefined
  ) {
    throw new ConfigurationFileError(
      `context ${name} refers to credentials '${unvalidated.credentials}', but no such credentials were configured`,
    )
  }

  if (unvalidated.team !== undefined && typeof unvalidated.team !== 'string') {
    throw new ConfigurationFileError(
      `context ${name} has a team that is not a string`,
    )
  }

  if (
    unvalidated.organization !== undefined &&
    typeof unvalidated.organization !== 'string'
  ) {
    throw new ConfigurationFileError(
      `context ${name} has a organization that is not a string`,
    )
  }

  if (
    unvalidated.database !== undefined &&
    typeof unvalidated.database !== 'string'
  ) {
    throw new ConfigurationFileError(
      `context ${name} has a database that is not a string`,
    )
  }

  if (
    unvalidated.branch !== undefined &&
    typeof unvalidated.branch !== 'string'
  ) {
    throw new ConfigurationFileError(
      `context ${name} has a branch that is not a string`,
    )
  }
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
    const name = config()?.current_context
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

  context(name: string): RuntimeContext {
    const c = config()
    if (c === null) {
      // we requested a named context, but the configuration file is missing.
      throw new ConfigurationFileError('config file is missing')
    }
    let context
    if (c.contexts !== undefined) {
      context = c.contexts[name]
    }
    if (context !== undefined) {
      let credentials: Auth
      // anonymous is a type of credential that has no further configuration options
      // as such, it makes no sense to declare it. We just assume its
      // existence rather than looking it up.
      if (context.credentials === 'anonymous') {
        credentials = { type: 'anonymous' }
      } else if (c.credentials === undefined) {
        throw new Error(
          `no credentials configured but credentials named '${context.credentials}' needed`,
        )
      } else {
        const foundCredentials = c.credentials[context.credentials]
        if (foundCredentials === undefined) {
          throw new Error(
            `no credentials named ${context.credentials} configured`,
          )
        }
        credentials = foundCredentials
      }
      let endpoint
      if (c.endpoints !== undefined) {
        endpoint = c.endpoints[context.endpoint]
      }
      if (credentials !== undefined && endpoint !== undefined) {
        if (context.team !== undefined) {
          endpoint = `${endpoint}/${context.team}`
        }
        return {
          endpoint,
          credentials,
          organization: context.organization,
          database: context.database,
          branch: context.branch,
        }
      } else {
        // this really should not happen if we validated the file properly.
        throw new Error('invalid data in configuration file')
      }
    } else {
      throw new ConfigurationFileError(
        `no context in configuration file with name '${name}'`,
      )
    }
  },
}
