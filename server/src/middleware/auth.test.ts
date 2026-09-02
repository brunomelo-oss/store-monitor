import { test } from 'node:test'
import assert from 'node:assert/strict'
import { currentOrganizationId } from '../middleware/auth'
import { AuthorizationError } from '../lib/errors'

function makeReq(user: any): any {
  return { user }
}

test('currentOrganizationId returns the organization id from the token', () => {
  const orgId = currentOrganizationId(makeReq({ organizationId: 42 }))
  assert.equal(orgId, 42)
})

test('currentOrganizationId throws when user is missing entirely', () => {
  assert.throws(
    () => currentOrganizationId(makeReq(undefined)),
    (err: any) => err instanceof AuthorizationError,
  )
})

test('currentOrganizationId throws when organizationId is null (no tenant defaulting)', () => {
  assert.throws(
    () => currentOrganizationId(makeReq({ organizationId: null })),
    (err: any) => err instanceof AuthorizationError,
  )
})

test('currentOrganizationId throws when organizationId is undefined', () => {
  assert.throws(
    () => currentOrganizationId(makeReq({})),
    (err: any) => err instanceof AuthorizationError,
  )
})
