import test from 'ava'
import { type ParseContext, parseResource, parseDb } from './parse.js'

test('database is parsed from resource', (t) => {
  const context: ParseContext = {}
  const resource = parseDb(['admin/foo'], context)
  t.is(resource.resource, 'admin/foo')
  t.is(resource.organization, 'admin')
  t.is(resource.database, 'foo')
})

test('database is parsed from org + db', (t) => {
  const context: ParseContext = {}
  const resource = parseDb(['admin', 'foo'], context)
  t.is(resource.resource, 'admin/foo')
  t.is(resource.organization, 'admin')
  t.is(resource.database, 'foo')
})

test('database is parsed from db and context org', (t) => {
  const context: ParseContext = {
    organization: 'admin',
  }
  const resource = parseDb(['foo'], context)
  t.is(resource.resource, 'admin/foo')
  t.is(resource.organization, 'admin')
  t.is(resource.database, 'foo')
})

test('database is fully inferred from context', (t) => {
  const context: ParseContext = {
    organization: 'admin',
    database: 'foo',
  }
  const resource = parseDb([], context)
  t.is(resource.resource, 'admin/foo')
  t.is(resource.organization, 'admin')
  t.is(resource.database, 'foo')
})

test('database name is overridden', (t) => {
  const context: ParseContext = {
    organization: 'admin',
    database: 'foo',
  }
  const resource = parseDb(['bar'], context)
  t.is(resource.resource, 'admin/bar')
  t.is(resource.organization, 'admin')
  t.is(resource.database, 'bar')
})

test('org and database name is overridden', (t) => {
  const context: ParseContext = {
    organization: 'admin',
    database: 'foo',
  }
  const resource = parseDb(['notadmin', 'bar'], context)
  t.is(resource.resource, 'notadmin/bar')
  t.is(resource.organization, 'notadmin')
  t.is(resource.database, 'bar')
})

test('direct resource is parsed', (t) => {
  const context: ParseContext = {}
  const resource = parseResource(['admin/foo'], context)
  t.is(resource.resource, 'admin/foo')
})

test('resource org + db is parsed', (t) => {
  const context: ParseContext = {}
  const resource = parseResource(['admin', 'foo'], context)
  t.is(resource.resource, 'admin/foo')
})

test('resource + branch is parsed', (t) => {
  const context: ParseContext = {}
  const resource = parseResource(['admin/foo', 'branch/second'], context)
  t.is(resource.resource, 'admin/foo/local/branch/second')
})

test('resource + commit is parsed', (t) => {
  const context: ParseContext = {}
  const resource = parseResource(
    ['admin/foo', 'commit/some_commit_id'],
    context,
  )
  t.is(resource.resource, 'admin/foo/local/commit/some_commit_id')
})
