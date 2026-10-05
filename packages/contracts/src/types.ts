import type { z } from 'zod'

import type {
  nanoContextSchema,
  nanoInstanceSchema,
  nanoModuleSchema,
  nanoRegistryEntrySchema,
  nanoRegistrySchema,
  nanoUserSchema,
} from './schemas'

export type NanoUser = z.infer<typeof nanoUserSchema>
export type NanoContext = z.infer<typeof nanoContextSchema>
export type NanoInstance = z.infer<typeof nanoInstanceSchema>
export type NanoModule = z.infer<typeof nanoModuleSchema>
export type NanoRegistryEntry = z.infer<typeof nanoRegistryEntrySchema>
export type NanoRegistry = z.infer<typeof nanoRegistrySchema>
