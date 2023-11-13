import { getContext } from './state.js'

export interface ParseContext {
  organization?: string
  database?: string
  branch?: string
}

export interface ParsedOrg {
  organization: string
}

export function parseOrg(args: string[], context?: ParseContext): ParsedOrg {
  const context_ = context ?? (getContext() as ParseContext)
  if (args.length === 0) {
    // everything comes from the context
    if (context_.organization === undefined) {
      throw new Error("couldn't resolve organization from context")
    }

    return {
      organization: context_.organization,
    }
  } else if (args.length !== 1) {
    // too much!
    throw new Error('Too many arguments to parse an organization')
  } else if (args[0].includes('/')) {
    throw new Error(`${args[0]} does not refer to an organization`)
  } else {
    return {
      organization: args[0],
    }
  }
}

export interface ParsedDb {
  resource: string
  organization: string | null
  database: string
}

export function parseDb(args: string[], context?: ParseContext): ParsedDb {
  const context_ = context ?? (getContext() as ParseContext)
  if (args.length === 0) {
    // everything comes from the context
    if (context_.database === undefined) {
      throw new Error("couldn't resolve database from context")
    }
    if (
      context_.organization === undefined &&
      !context_.database.startsWith('_')
    ) {
      throw new Error("couldn't resolve organization from context")
    }
    return {
      resource:
        context_.organization === undefined
          ? context_.database
          : `${context_.organization}/${context_.database}`,
      organization: context_.organization ?? null,
      database: context_.database,
    }
  } else if (args.length === 1) {
    // we're at least specifying the database now, but possibly we're specifying a full resource
    if (args[0].startsWith('_')) {
      // it's a special system graph that is not contained in an organization
      return {
        resource: args[0],
        organization: null,
        database: args[0],
      }
    } else if (args[0].includes('/')) {
      // assume it's a full resource
      const m = args[0].match(/^([^/]+)\/([^/]+)$/)
      if (m === null) {
        throw new Error('resource format was not for a database')
      }
      return {
        resource: args[0],
        organization: m[1],
        database: m[2],
      }
    } else {
      // This is only talking about a database. get organization from context
      if (context_.organization === undefined) {
        throw new Error('organization was not present in context')
      }
      return {
        resource: `${context_.organization}/${args[0]}`,
        organization: context_.organization,
        database: args[0],
      }
    }
  } else if (args.length === 2) {
    // both organization and database are given as separate words
    const database = args.pop()
    if (database === undefined) {
      throw new Error('no database (impossible)')
    }
    if (database.includes('/')) {
      throw new Error("database is not allowed to contain a '/'")
    }

    const organization = parseOrg(args, context).organization
    return {
      resource: `${organization}/${database}`,
      organization,
      database,
    }
  } else {
    throw new Error('too many arguments for resolving a database')
  }
}

export interface ParsedBranch {
  resource: string
  organization: string
  database: string
  branch: string
}

export function parseBranch(
  args: string[],
  context?: ParseContext,
): ParsedBranch {
  const context_ = context ?? (getContext() as ParseContext)
  if (args.length === 0) {
    // everything comes from the context
    if (context_.organization === undefined) {
      throw new Error("couldn't resolve organization from context")
    }
    if (context_.database === undefined) {
      throw new Error("couldn't resolve database from context")
    }
    let branch = context_.branch
    if (branch === undefined) {
      branch = 'main'
    }
    return {
      resource: `$(context.organization}/${context_.database}/local/branch/${branch}`,
      organization: context_.organization,
      database: context_.database,
      branch,
    }
  } else if (args.length === 1) {
    // we're at least specifying the branch, but possibly we're specifying a full resource
    if (args[0].includes('/')) {
      const m = args[0].match(/^([^/]+)\/([^/]+)(\/local\/branch\/([^/]+))?$/)
      if (m === null) {
        throw new Error('resource does not describe a branch')
      }
      if (m[3] === undefined) {
        // this is describing just a database, with an implicit main branch
        return {
          resource: `${m[1]}/${m[2]}`,
          organization: m[1],
          database: m[2],
          branch: 'main',
        }
      } else {
        return {
          resource: `${m[1]}/${m[2]}/local/branch/${m[4]}`,
          organization: m[1],
          database: m[2],
          branch: m[4],
        }
      }
    } else {
      // it's just a branch name. everything else comes from context.
      if (context_.organization === undefined) {
        throw new Error("couldn't resolve organization from context")
      }
      if (context_.database === undefined) {
        throw new Error("couldn't resolve database from context")
      }
      return {
        resource: `$(context.organization}/${context_.database}/local/branch/${args[0]}`,
        organization: context_.organization,
        database: context_.database,
        branch: args[0],
      }
    }
  } else {
    // last argument should be a branch name, everything before should be resolvable as a database
    const branch = args.pop()
    if (branch === undefined) {
      // make type checking happy, but really we've asserted above that this can't happen
      throw new Error('impossible')
    }

    const db = parseDb(args, context)
    if (db.organization === null) {
      throw new Error('system graphs have no branch')
    }
    return {
      resource: `${db.organization}/${db.database}/local/branch/${branch}`,
      organization: db.organization,
      database: db.database,
      branch,
    }
  }
}

export interface ParsedResource {
  resource: string
}

export function parseResource(
  args: string[],
  context?: ParseContext,
): ParsedResource {
  // resources are a bit special in how we present them.
  // first of, a full path to some branch or commit is a resource
  // but just the path to a database will auto-complete to
  // local/branch/main, and just the path to a repository will also
  // complete to the main branch of that repo.
  //
  // It is very useful to quickly be able to specify a branch or
  // commit against whatever is in context.
  // But unfortunately, branch/asdf would be interpreted as an
  // organization called 'branch' with a database asdf, not branch
  // asdf on whatever is currently the context database, if we were to
  // follow normal rules.
  // Instead, 'branch' and 'commit' are specially recognized words,
  // making the resolution slightly different.
  const context_ = context ?? (getContext() as ParseContext)

  if (args.length === 0) {
    // everything from context.
    if (context_.database === undefined) {
      throw new Error('database could not be resolved from context')
    }
    if (
      context_.organization === undefined &&
      context_.database.startsWith('_')
    ) {
      // special case. ignore whatever else might be in context.
      return {
        resource: context_.database,
      }
    } else {
      // we have at least an organization and database. That is enough
      // for a resource, but we might know more.
      let resource = `$(context.organization}/${context_.database}`
      if (context_.branch !== undefined) {
        resource += `/local/branch/${context_.branch}`
      }
      return { resource }
    }
  } else if (
    args.length === 1 &&
    !(args[0].startsWith('branch/') || args[0].startsWith('commit/')) &&
    args[0].includes('/')
  ) {
    // full resource
    return { resource: args[0] }
  } else {
    const last = args.pop()
    if (last === undefined) {
      throw new Error('expected at least one argument (impossible)')
    }
    if (last.startsWith('branch/') || last.startsWith('commit/')) {
      // last argument is a branch/commit, everything before describes a database
      const matches = last.match(/^(branch|commit)\/(.*)$/)
      if (matches === null) {
        throw new Error('could not match branch or commit (impossible)')
      }
      const typ = matches[1]
      const branch = matches[2]
      const db = parseDb(args, context)
      return {
        resource: `${db.resource}/local/${typ}/${branch}`,
      }
    } else {
      // last argument is a database name. the thing before has to be an organization
      const org = parseOrg(args, context)
      return {
        resource: `${org.organization}/${last}`,
      }
    }
  }
}
