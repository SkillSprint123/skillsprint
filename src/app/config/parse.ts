import { appConfigSchema } from './schemas'
import type { AppConfig } from './types'

export const parseAppConfig = (value: unknown): AppConfig =>
  appConfigSchema.parse(value)
