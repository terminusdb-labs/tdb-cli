# tdb-cli: A CLI client for TerminusDB

This tool lets you do basic things to a terminusdb instance, like storing and retrieving documents.

## Installation

While this repository is unpublished, the way to install is by manually cloning this repository, then running

```
npm install -g <path to cloned repository>
```

The installed binary will be a symlink into the repository directory. This also means that code changes in this directory are immediately available in the installed CLI tool after build.

## Argument interpretation
Most of the commands in this tool operate on databases, branches and
more generically, resources. The way these are specified are uniform
across commands.

This tool will use a combination of information in your configuration
file, command line flags and finally the parameters of this command to
figure out what resource to work with.

### Specifying a database
#### No arguments
Without argument, everything is inferred from context.

#### One argument
If the single argument contains a /, it is assumed to be in the format `<organization>/<database>`.
Otherwise, it is assumed to be a database name, and organization is taken from context.

Example: `tdb-cli db info mydatabase`

#### Two arguments
With two arguments, the first is the organization name, and the second is the database name.

Example: `tdb-cli db info myorganization mydatabase`

### Specifying a branch
#### No arguments
Without argument, everything is inferred from context.

#### One argument
If the single argument contains a /, it is assumed to be a path leading to a branch.
This is either `<organization>/<database>`, or `<organization>/<database>/local/branch/<branch>`.
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

## Manual build

To rebuild the CLI tool, just run

```
npm run build
```

If you previously installed from directory, this will refresh the installed binary too.

## Development

To continuously rebuild the CLI tool whenever changes are made to the typescript code, run

```
npm run dev
```

This will start a process which incrementally rebuilds typescript code as files get edited. If you previously installed from directory, this will keep the binary in sync with the source.
