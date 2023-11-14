import { Command } from '@commander-js/extra-typings'
import {
  config,
  configPath,
  type ValidatedConfig,
  type Auth,
  type ContextConfig,
  ConfigurationFileError,
} from './config.js'
import fs from 'fs'
import inquirer from 'inquirer'
import yaml, { Pair, type YAMLMap } from 'yaml'

const command = new Command()
  .name('setup')
  .description('interactively setup tdb-cli')
  .action(async () => {
    console.log(`Welcome to tdb-cli, the CLI tool for TerminusDB!

This setup will ask a few questions to generate your configuration.
This configuration file will be stored at ${configPath()}.
`)

    let fileAction: 'another-server' | 'reinitialize' | undefined
    if (fs.existsSync(configPath())) {
      console.log(`There is already a configuration file at ${configPath()}.`)
      const result = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What do you wish to do?',
        choices: [
          {
            name: 'Add another server to the configuration',
            value: 'another-server',
          },
          {
            name: 'Reinitialize the configuration (creates backup)',
            value: 'reinitialize',
          },
          {
            name: 'Abort',
            value: 'abort',
          },
        ],
      })
      if (result.action === 'abort') {
        console.error('Configuration file already exists. aborting.')
        process.exit(1)
      }

      fileAction = result.action
    }

    const location = await inquirer.prompt({
      type: 'list',
      name: 'where',
      message: 'What instance of TerminusDB do you intend to connect to?',
      choices: [
        'TerminusCMS',
        { name: 'Self-hosted TerminusDB', value: 'self-hosted' },
      ],
    })

    const config: ValidatedConfig = {}
    if (location.where === 'TerminusCMS') {
      console.log(
        `TerminusCMS requires a team name and an authentication token to connect.
You'll find this information in the TerminusCMS dashboard.`,
      )
      const response = await inquirer.prompt([
        {
          type: 'input',
          name: 'team',
          message: 'Team name: ',
        },
        {
          type: 'input',
          name: 'token',
          message: 'Token: ',
        },
      ])
      config.endpoints = {
        TerminusCMS: 'https://cloud.terminusdb.com',
      }
      const credentials: Auth = { type: 'token', token: response.token }
      config.credentials = {}
      config.credentials[response.team] = credentials
      const context: ContextConfig = {
        endpoint: 'TerminusCMS',
        credentials: response.team,
        team: response.team,
        organization: response.team,
      }
      config.contexts = {}
      config.contexts[response.team] = context

      config.current_context = response.team
    } else {
      const response = await inquirer.prompt([
        {
          type: 'input',
          name: 'endpoint',
          message: 'What name do you wish to use for this server?',
          validate: reservedName,
        },
        {
          type: 'input',
          name: 'url',
          message: 'Server endpoint URL:',
        },
        {
          type: 'input',
          name: 'username',
          message: 'Username:',
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password:',
          mask: '*',
        },
        {
          type: 'input',
          name: 'organization',
          message: 'Default organization (blank if none):',
        },
      ])
      config.endpoints = {}
      config.endpoints[response.endpoint] = response.url
      const credentials: Auth = {
        type: 'basic',
        username: response.username,
        password: response.password,
      }
      config.credentials = {}
      config.credentials[response.endpoint] = credentials
      const context: ContextConfig = {
        endpoint: response.endpoint,
        credentials: response.endpoint,
      }
      if (response.organization !== '') {
        context.organization = response.organization
      }
      config.contexts = {}
      config.contexts[response.endpoint] = context

      config.current_context = response.endpoint
    }

    let yamlConfig
    if (fileAction === 'reinitialize') {
      yamlConfig = createNewConfig(config)
    } else {
      yamlConfig = appendToConfig(config)
    }
    backupExistingConfig()
    fs.writeFileSync(configPath(), yamlConfig)

    console.log(
      `Configuration has been written to ${configPath()}. You are all set!`,
    )
  })

const _reservedNames = ['TerminusCMS', 'anonymous']
function reservedName(name: string): boolean | string {
  if (_reservedNames.includes(name)) {
    return `name cannot be ${name}`
  } else {
    return true
  }
}

function createNewConfig(config: ValidatedConfig): string {
  return yaml.stringify(config)
}

function appendToConfig(conf: ValidatedConfig): string {
  // we should first make sure the existing config is even valid
  // retrieving it will throw an error if it is bad
  try {
    config()
  } catch (e) {
    if (e instanceof ConfigurationFileError) {
      console.error(
        'existing configuration file is malformed. Please fix the existing configuration file first.',
      )
      console.error(e.message)
      process.exit(1)
    } else {
      throw e
    }
  }
  if (
    conf.current_context === undefined ||
    conf.credentials === undefined ||
    conf.contexts === undefined ||
    conf.endpoints === undefined
  ) {
    // shouldn't be possible
    throw new Error()
  }

  const contextName = conf.current_context
  const endpointName = conf.contexts[contextName].endpoint
  const credentialsName = conf.contexts[contextName].credentials

  const file = fs.readFileSync(configPath(), 'utf8')
  const toplevel = yaml.parseDocument(file)
  if (toplevel.contents === null) {
    toplevel.contents = toplevel.createNode({}) as YAMLMap.Parsed
  }
  const contents = toplevel.contents as YAMLMap
  const endpoints = contents.get('endpoints') as YAMLMap | undefined
  const credentials = contents.get('credentials') as YAMLMap | undefined
  const contexts = contents.get('contexts') as YAMLMap | undefined

  if (contexts?.get(contextName) !== undefined) {
    console.error(
      `Configuration already contains a context named ${contextName}. Nothing was written.`,
    )
    process.exit(1)
  }

  if (credentials?.get(credentialsName) !== undefined) {
    console.error(
      `Configuration already contains credentials named ${credentialsName}. Nothing was written.`,
    )
    process.exit(1)
  }

  const existingEndpoint = endpoints?.get(endpointName)
  if (existingEndpoint !== undefined) {
    // might be fine. let's see if it is equivalent
    if (existingEndpoint !== conf.endpoints[endpointName]) {
      console.error(
        `Configuration already contains a different endpoint named ${endpointName}. Nothing was written.`,
      )
      process.exit(1)
    }
  } else {
    // no endpoint in sight. add it to the bottom
    if (endpoints !== undefined) {
      endpoints.items.push(new Pair(endpointName, conf.endpoints[endpointName]))
    } else {
      contents.add(new Pair('endpoints', conf.endpoints))
    }
  }

  if (credentials !== undefined) {
    credentials.items.push(
      new Pair(credentialsName, conf.credentials[credentialsName]),
    )
  } else {
    contents.add(new Pair('credentials', conf.credentials))
  }

  if (contexts !== undefined) {
    contexts.items.push(new Pair(contextName, conf.contexts[contextName]))
  } else {
    contents.add(new Pair('contexts', conf.contexts))
  }

  contents.set('current_context', conf.current_context)

  return String(toplevel)
}

function backupExistingConfig(): void {
  if (fs.existsSync(configPath())) {
    let bakPath = configPath() + '.bak'
    if (fs.existsSync(bakPath)) {
      // Someone previously backed up. We want to be super careful not to overwrite something.
      let counter = 1
      while (fs.existsSync(bakPath + `.${counter}`)) {
        counter += 1
      }
      bakPath += `.${counter}`
    }

    fs.copyFileSync(configPath(), bakPath)
    console.log(`Backed up existing configuration to ${bakPath}`)
  }
}

export default command
