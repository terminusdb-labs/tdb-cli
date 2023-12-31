# tdb-cli: A CLI client for TerminusDB

This tool lets you do basic things to a terminusdb instance, like storing and retrieving documents.

## Installation
```
npm install -g @terminusdb/tdb-cli
```

Then,
```
tdb-cli setup
```

`tdb-cli setup` will start an interactive setup tool to create your configuration.

## Features
tdb-cli is a new tool, so it cannot yet do everything that TerminusDB can.

The following subcommands are now implemented:
- `db`: create and delete databases and retrieve information about them
- `branch`: create, list and delete branches
- `doc`: CRUD operations on documents in the database
- `log`: shows the commit history
- `graphql`: launch a GraphiQL instance or get the schema for a resource
- `curl`: run arbitrary curl commands using the endpoint and credentials in context
- `config`: utilities for querying and changing your configuration
- `setup`: an interactive setup tool for your configuration

## Context
Whenever possible, tdb-cli will try to infer what you're trying to
work with from context. This context is usually your configuration
file (~/.tdb.yml), but also includes top-level command line options,
and environment variables.

Notably, the configuration file can have a `current_context`
configured. If you ran `tdb-cli setup`, the last element you added
will be the current context, and will be what is used in all
operations.

If you have more than one context configured, you can explicitely
choose which one to use using the top-level option `-c` like so:

```
tdb-cli -c myspecialcontext doc get myorg/foo
```

You can also switch to the context you like using
```
tdb-cli config context switch myspecialcontext
```

After that, `myspecialcontext` will be used for all operations that
require a context without having to explicitely specify it.

To see what contexts are available to you, do
```
tdb-cli config context list
```

## Argument interpretation
Most of the commands in this tool operate on databases, branches and
more generically, resources. The way these are specified are uniform
across commands.

This tool will use a combination of information in your configuration
file, command line flags and finally the parameters of the command to
figure out what resource to work with.

### Specifying a database
#### No arguments
Without argument, everything is inferred from context.

#### One argument
If the single argument contains a /, it is assumed to be in the format `<organization>/<database>`.

Example: `tdb-cli db info myorganization/mydatabase`

Otherwise, it is assumed to be a database name, and organization is taken from context.

Example: `tdb-cli db info mydatabase`

#### Two arguments
With two arguments, the first is the organization name, and the second is the database name.

Example: `tdb-cli db info myorganization mydatabase`

### Specifying a branch
#### No arguments
Without argument, everything is inferred from context.

#### One argument
If the single argument contains a /, it is assumed to be a path
leading to a branch.  This is either `<organization>/<database>` (in
which case the 'main' branch is inferred), or
`<organization>/<database>/local/branch/<branch>`.

Example: `tdb-cli branch create myorganization/mydatabase/local/branch/newbranch`

Otherwise, it is assumed to be a branch name, and the organization and
database will be taken from context.

Example: `tdb-cli branch create newbranch`

#### More than one argument
If there is more than one argument, the very last argument will be
interpreted as the branch name, and everything before that as
specifying the database.

Examples:
- `tdb-cli branch create mydatabase newbranch`
- `tdb-cli branch create myorganization mydatabase newbranch`
- `tdb-cli branch create myorganization/mydatabase newbranch`

### Specifying a resource
#### No arguments
Without argument, everything is inferred from context.

#### One argument
If the single argument starts with `branch/` or `commit/`, it is
interpreted as referring to a branch or commit within the database
that is inferred from the context.

Examples:
- `tdb-cli doc get branch/mybranch`
- `tdb-cli doc get commit/some_commit_id`

Otherwise, if it contains a `/`, or starts with a `_`, it is
interpreted as a full resource path.

Examples:
- `tdb-cli doc get myorganization/mydatabase`
- `tdb-cli doc get myorganization/mydatabase/local/branch/somebranch`
- `tdb-cli doc get _system`

If none of the above is true, the single argument will be interpreted
as a database name, and the default branch of that database (main)
will be used.

Example: `tdb-cli doc get mydatabase`

When not specifying a full resource path, the missing components will
be taken from context.

#### More than one argument
If there is more than one argument, the last argument will determine
how to interpret the previous ones.

If it refers to a branch or commit using the syntax described in the
previous section, the previous arguments are interpreted as referring
to a database.

Examples:
- `tdb-cli doc get mydatabase branch/somebranch`
- `tdb-cli doc get mydatabase commit/some_commit_id`
- `tdb-cli doc get myorganization mydatabase branch/somebranch`
- `tdb-cli doc get myorganization/mydatabase branch/somebranch`

Otherwise, the last argument is assumed to be a database, and the
(single) previous command is an organization.

Example: `tdb-cli doc get myorganization mydatabase`

## The configuration file
By default, the configuration file lives in your homedir at `~/.tdb.yml`. This can be overridden with the environment variable `TDB_CLI_CONFIG_PATH`.

The configuration file is a YAML consisting of 3 sections:
- `endpoints`: all the endpoints you wish to connect to
- `credentials`: credentials to use while connecting
- `contexts`: configurations to use as defaults in tdb-cli

Finally, there's a field `current_context`, which configures the
context used when not overridden.

### Endpoints
Endpoints are a simple key value mapping from names to URLs.

Example:
```yaml
endpoints:
  foo: http://example.org
  bar: http://example.com
```

### Credentials
There are four types of credentials:
- basic: Authentication with a username and password. This is what you'll most likely need for a self-hosted instance of TerminusDB.
- token: Authentication with a token. This is what TerminusCMS uses.
- anonymous: No authentication. This can be used with public endpoints. While allowed, you never actually have to explicitely configure this, as an implicit `anonymous` credentials is always configured.
- forwarded: 'fake' authentication using the header `X-User-Forward`. This is sometimes used in scenarios where actual authentication is done using proxy middleware. You'll probably not need this.

These credentials are configured in a key-value map like so:
```yaml
credentials:
  foo:
    type: basic
    username: britney
    password: chicken123
  bar:
    type: token
    token: ..some long token here..
  baz:
    type: anonymous
  quux:
    type: forwarded
    username: taylor
```

As a special case, the credentials named `anonymous` (of type
`anonymous`) is always assumed to exist. There is no need to
explicitely configure it.

### Contexts
A context describes which endpoint to use with which set of
credentials, and optionally configures a default `team`, `organization`,
`database` and `branch`.

The names used for the endpoint and the credentials correspond to the
keys in the mappings described above.

Note that `team` is only relevant in the context of TerminusCMS and
will not work out of the box with a self-hosted instance.

Example:
```yaml
contexts:
  foo:
    endpoint: myendpoint
    credentials: mycredentials
  foo-defaults:
    endpoint: myendpoint
    credentials: mycredentials
    organization: myorg
    database: mydb
    branch: somebranch
  cms:
    endpoint: TerminusCMS
    credentials: mytokencredentials
    # note that on TerminusCMS, team and organization tend to be the same
    # unless you're collaborating across organizations.
    team: myteam
    organization: myteam
```

### An example minimum configuration for a self-hosted instance
This is what `tdb-cli setup` will produce for a self-hosted instance with credentials `admin:root` and 'admin' as the default organization:

```yaml
endpoints:
  local: http://localhost:6363
credentials:
  local:
    type: basic
    username: admin
    password: root
contexts:
  local:
    endpoint: local
    credentials: local
    organization: admin
current_context: local
```
