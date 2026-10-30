import type { z } from 'zod'
import type { PropsWithChildren, FormEvent } from 'react'
import type { PlanId } from '../plans/types'
import type {
  accountStateSchema,
  loginDetailsSchema,
  profileFieldsSchema,
} from './schemas'

export type AccountState = z.infer<typeof accountStateSchema>
export type ProfileFields = z.infer<typeof profileFieldsSchema>
export type LoginDetails = z.infer<typeof loginDetailsSchema>
export type AuthProviderProps = PropsWithChildren
export type FormSubmitEvent = FormEvent<HTMLFormElement>
export type ProfileErrors = Partial<Record<keyof ProfileFields, string>>
export type AccountStorage = Pick<Storage, 'getItem' | 'setItem'>
export type AuthContextValue = {
  account: AccountState
  storageError: boolean
  signIn: (details: LoginDetails) => void
  signOut: () => void
  updateProfile: (profile: ProfileFields) => boolean
  choosePlan: (plan: PlanId) => boolean
}
