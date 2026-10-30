import {
  accountStateSchema,
  loginDetailsSchema,
  profileFieldsSchema,
  returnLocationSchema,
} from './schemas'
import { joinRoute } from '../router/paths'
import { planIdSchema } from '../plans/schemas'
import type { PlanId } from '../plans/types'
import type {
  AccountState,
  AccountStorage,
  LoginDetails,
  ProfileFields,
} from './types'

export const ACCOUNT_STORAGE_KEY = 'skillsprint.account.v1'

export const createAccount = (): AccountState =>
  accountStateSchema.parse({
    schemaVersion: 1,
    mode: 'demo',
    signedIn: false,
    profile: {
      id: `demo-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      displayName: 'Участник',
      email: '',
      role: '',
      level: 'beginner',
      goal: '',
      avatar: 'blue',
    },
  })

export const parseStoredAccount = (
  value: string | null,
): AccountState | null => {
  if (!value) return null
  try {
    const parsed = accountStateSchema.safeParse(JSON.parse(value))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export const readAccount = (storage: AccountStorage): AccountState | null => {
  try {
    return parseStoredAccount(storage.getItem(ACCOUNT_STORAGE_KEY))
  } catch {
    return null
  }
}

export const saveAccount = (
  storage: AccountStorage,
  account: AccountState,
): boolean => {
  try {
    storage.setItem(
      ACCOUNT_STORAGE_KEY,
      JSON.stringify(accountStateSchema.parse(account)),
    )
    return true
  } catch {
    return false
  }
}

// This is an explicit local demo session, not a server authentication credential.
// Passwords are never accepted by this adapter or written to storage.
export const enterAccount = (
  account: AccountState,
  details: LoginDetails,
): AccountState => {
  const input = loginDetailsSchema.parse(details)
  const name = profileFieldsSchema.shape.displayName.safeParse(
    input.displayName,
  )
  const email = profileFieldsSchema.shape.email.safeParse(input.email?.trim())
  return accountStateSchema.parse({
    ...account,
    signedIn: true,
    profile: {
      ...account.profile,
      displayName: name.success ? name.data : account.profile.displayName,
      email: email.success && email.data ? email.data : account.profile.email,
    },
  })
}

export const editAccount = (
  account: AccountState,
  fields: ProfileFields,
): AccountState => ({
  ...account,
  profile: { ...account.profile, ...profileFieldsSchema.parse(fields) },
})

export const changeAccountPlan = (
  account: AccountState,
  plan: PlanId,
): AccountState => ({
  ...account,
  plan: planIdSchema.parse(plan),
})

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join('')
    .toLocaleUpperCase('ru-RU') || 'У'

export const returnAfterLogin = (state: unknown, basePath: string): string => {
  const parsed = returnLocationSchema.safeParse(state)
  if (!parsed.success) return basePath
  const path = parsed.data.from
  const pathname = path.split(/[?#]/)[0]
  const prefix = basePath === '/' ? '/' : `${basePath}/`
  const authPaths = ['login', 'register'].map((part) =>
    joinRoute(basePath, part),
  )
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.includes('\\') ||
    Array.from(path).some((character) => character.charCodeAt(0) < 32) ||
    (pathname !== basePath && !pathname.startsWith(prefix)) ||
    pathname.split('/').some((part) => /^(?:\.|%2e){1,2}$/i.test(part)) ||
    authPaths.some(
      (auth) => pathname === auth || pathname.startsWith(`${auth}/`),
    )
  )
    return basePath
  return path
}
