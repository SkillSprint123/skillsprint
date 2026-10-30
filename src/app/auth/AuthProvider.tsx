import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './context'
import {
  ACCOUNT_STORAGE_KEY,
  createAccount,
  changeAccountPlan,
  editAccount,
  enterAccount,
  parseStoredAccount,
  readAccount,
  saveAccount,
} from './storage'
import type {
  AccountState,
  AuthProviderProps,
  LoginDetails,
  ProfileFields,
} from './types'
import type { PlanId } from '../plans/types'

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [account, setAccount] = useState(() => {
    try {
      return readAccount(window.localStorage) || createAccount()
    } catch {
      return createAccount()
    }
  })
  const [storageError, setStorageError] = useState(false)
  const persist = useCallback((next: AccountState) => {
    let saved = false
    try {
      saved = saveAccount(window.localStorage, next)
    } catch {
      /* Browser storage may be disabled. */
    }
    setStorageError(!saved)
    setAccount(next)
    return saved
  }, [])

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== ACCOUNT_STORAGE_KEY && event.key !== null) return
      try {
        if (event.storageArea !== window.localStorage) return
      } catch {
        return
      }
      const next = parseStoredAccount(event.newValue)
      setAccount(next || createAccount())
      setStorageError(false)
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const signIn = useCallback(
    (details: LoginDetails) => {
      persist(enterAccount(account, details))
    },
    [account, persist],
  )
  const signOut = useCallback(() => {
    persist({ ...account, signedIn: false })
  }, [account, persist])
  const updateProfile = useCallback(
    (fields: ProfileFields) => persist(editAccount(account, fields)),
    [account, persist],
  )
  const choosePlan = useCallback(
    (plan: PlanId) => persist(changeAccountPlan(account, plan)),
    [account, persist],
  )
  const value = useMemo(
    () => ({
      account,
      storageError,
      signIn,
      signOut,
      updateProfile,
      choosePlan,
    }),
    [account, storageError, signIn, signOut, updateProfile, choosePlan],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
