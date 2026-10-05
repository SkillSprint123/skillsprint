import { z } from 'zod'
import { nanoRegistrySchema } from '../../contracts/src'

export const loadedRegistrySchema = z.object({
  registry: nanoRegistrySchema,
  url: z.string().url(),
})

export const nanoStateSchema = z.object({
  status: z.enum(['loading', 'mounted', 'unavailable', 'error']),
  message: z.string().optional(),
})
