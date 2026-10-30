import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  ACCOUNT_STORAGE_KEY,
  createAccount,
  editAccount,
  enterAccount,
  initials,
  parseStoredAccount,
  readAccount,
  returnAfterLogin,
  saveAccount,
} from '../../src/app/auth/storage'
import {
  accountStateSchema,
  profileFieldsSchema,
} from '../../src/app/auth/schemas'
import type { AccountStorage } from '../../src/app/auth/types'

test('quick login always accepts empty or arbitrary login details without changing the account identity', () => {
  const initial = createAccount()
  for (const details of [
    {},
    { email: '', displayName: '' },
    { email: 'any-login', displayName: ' '.repeat(100) },
  ]) {
    const account = enterAccount(initial, details)
    assert.equal(account.signedIn, true)
    assert.equal(account.mode, 'demo')
    assert.equal(account.profile.id, initial.profile.id)
    assert.equal(account.profile.displayName, 'Участник')
  }
  const account = enterAccount(initial, {
    displayName: '  Мария Иванова  ',
    email: 'maria@example.com',
  })
  assert.equal(account.profile.displayName, 'Мария Иванова')
  assert.equal(account.profile.email, 'maria@example.com')
})

test('local account persists login, profile edits, and logout while never persisting passwords', () => {
  const values = new Map<string, string>()
  const storage: AccountStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
  }
  assert.equal(readAccount(storage), null)
  const details = { email: 'demo@example.com', password: 'must-not-be-stored' }
  const loggedIn = enterAccount(createAccount(), details)
  assert.equal(saveAccount(storage, loggedIn), true)
  assert.deepEqual(readAccount(storage), loggedIn)
  assert.equal(
    values.get(ACCOUNT_STORAGE_KEY)?.includes('must-not-be-stored'),
    false,
  )
  const updated = editAccount(loggedIn, {
    ...loggedIn.profile,
    displayName: 'Алексей',
    role: 'Frontend',
    level: 'middle',
    goal: 'Найти новую работу',
    avatar: 'teal',
  })
  assert.equal(updated.profile.id, loggedIn.profile.id)
  assert.equal(updated.profile.createdAt, loggedIn.profile.createdAt)
  assert.equal(saveAccount(storage, { ...updated, signedIn: false }), true)
  const restored = readAccount(storage)
  assert.equal(restored?.signedIn, false)
  assert.equal(restored?.profile.displayName, 'Алексей')
  assert.equal(enterAccount(restored!, {}).profile.id, loggedIn.profile.id)
  assert.equal(enterAccount(restored!, {}).profile.goal, 'Найти новую работу')
})

test('corrupted storage and unavailable browser storage do not crash account loading', () => {
  for (const value of [
    null,
    '',
    '{',
    '{}',
    JSON.stringify({ signedIn: true }),
    JSON.stringify({ ...createAccount(), schemaVersion: 2 }),
  ])
    assert.equal(parseStoredAccount(value), null)
  const broken: AccountStorage = {
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('quota')
    },
  }
  assert.equal(readAccount(broken), null)
  assert.equal(saveAccount(broken, createAccount()), false)
  assert.equal(
    accountStateSchema.safeParse({
      ...createAccount(),
      profile: { id: 'fake' },
    }).success,
    false,
  )
})

test('profile validation protects stored fields and avatar initials support Cyrillic', () => {
  const account = createAccount()
  for (const patch of [
    { displayName: ' ' },
    { email: 'invalid' },
    { level: 'unknown' },
    { avatar: 'unknown' },
    { goal: 'a'.repeat(301) },
  ])
    assert.equal(
      profileFieldsSchema.safeParse({ ...account.profile, ...patch }).success,
      false,
    )
  assert.equal(initials('  Мария   Иванова '), 'МИ')
  assert.equal(initials('Алексей'), 'А')
  assert.equal(initials(''), 'У')
})

test('login returns to local nested routes and rejects external destinations and auth loops', () => {
  assert.equal(
    returnAfterLogin(
      { from: '/skillsprint/interview/session?tab=answer#question' },
      '/skillsprint',
    ),
    '/skillsprint/interview/session?tab=answer#question',
  )
  assert.equal(
    returnAfterLogin(
      { from: '/stand/skillsprint/account' },
      '/stand/skillsprint',
    ),
    '/stand/skillsprint/account',
  )
  assert.equal(returnAfterLogin({ from: '/account' }, '/'), '/account')
  for (const from of [
    'https://evil.test',
    '//evil.test',
    '/other',
    '/skillsprint/login',
    '/skillsprint/register?next=/skillsprint',
    '/skillsprint/../other',
    '/skillsprint/%2e%2e/other',
    '/skillsprint/\\evil',
    '/skillsprint/account\n',
  ])
    assert.equal(returnAfterLogin({ from }, '/skillsprint'), '/skillsprint')
  assert.equal(returnAfterLogin(undefined, '/skillsprint'), '/skillsprint')
})
