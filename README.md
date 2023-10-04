# tdb-cli: A CLI client for TerminusDB

This tool lets you do basic things to a terminusdb instance, like storing and retrieving documents.

## Installation

While this repository is unpublished, the way to install is by manually cloning this repository, then running

```
npm install -g <path to cloned repository>
```

The installed binary will be a symlink into the repository directory. This also means that code changes in this directory are immediately available in the installed CLI tool after build.

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
