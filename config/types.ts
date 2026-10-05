import type { z } from 'zod'
import type {
  nanoSourcesSchema,
  sourceLockSchema,
  releaseReceiptSchema,
} from './schemas'

export type NanoSources = z.infer<typeof nanoSourcesSchema>
export type NanoSource = NanoSources['nanos'][string]
export type SourceLock = z.infer<typeof sourceLockSchema>
export type ReleaseReceipt = z.infer<typeof releaseReceiptSchema>
