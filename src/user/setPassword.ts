import { Command } from '@commander-js/extra-typings'
import { getClient, getContext } from '../state.js'
import inquirer from 'inquirer'
import { configPath } from '../config.js'
import yaml, { type YAMLMap } from 'yaml'
import fs from 'fs'

const command = new Command()
  .name('set-password')
  .description('Set the password')
  .argument(
    '[user]',
    'the user to change the password for. Defaults to the user from context.',
  )
  .option('-p, --password <password>', 'password to set to')
  .action(async (user, options) => {
    const context = getContext()
    let username: string
    if (user !== undefined) {
      username = user
    } else {
      if (
        context.contextName === undefined ||
        context.credentials.type !== 'basic'
      ) {
        console.error('User not from context or does not use basic auth')
        process.exit(1)
      } else {
        username = context.credentials.username
      }
    }
    let password: string
    if (options.password !== undefined) {
      password = options.password
    } else {
      for (;;) {
        const response = await inquirer.prompt([
          {
            type: 'password',
            name: 'password',
            message: 'Password: ',
            mask: '*',
          },
          {
            type: 'password',
            name: 'password2',
            message: 'Retype Password: ',
            mask: '*',
          },
        ])
        if (response.password !== response.password2) {
          console.error('Passwords do not match')
        } else {
          password = response.password
          break
        }
      }
    }
    const request = getClient()
      .post(`api/user/${username}`)
      .type('json')
      .send({
        password,
      })
      .ok(
        (res) => res.status === 200 || (res.status >= 400 && res.status <= 399),
      )
    const response = await request
    if (response.status !== 200) {
      console.error(response.body['@api:message'])
      process.exit(1)
    }

    if (user === undefined && context.contextName !== undefined) {
      // let's change the configuration to the newly set password
      const file = fs.readFileSync(configPath(), 'utf8')
      const toplevel = yaml.parseDocument(file)
      if (toplevel.contents === null) {
        toplevel.contents = toplevel.createNode({}) as YAMLMap.Parsed
      }
      const contents = toplevel.contents as YAMLMap
      const credentials = contents.get('credentials') as YAMLMap | undefined
      const contexts = contents.get('contexts') as YAMLMap | undefined
      const fileContext = contexts?.get(context.contextName) as
        | YAMLMap
        | undefined
      if (fileContext !== undefined && credentials !== undefined) {
        const credentialsName = fileContext.get('credentials') as string
        const fileCredentials = credentials.get(credentialsName) as YAMLMap
        if (fileCredentials.get('type') !== 'basic') {
          // final sanity check failed
          throw new Error(
            `Expected auth to have type basic but was ${
              fileCredentials.get('type') as string
            }`,
          )
        }
        fileCredentials.set('password', password)

        fs.writeFileSync(configPath(), String(toplevel))
      }
    }
  })

export default command
