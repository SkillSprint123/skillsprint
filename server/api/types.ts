import type { z } from 'zod'

import type { healthResponseSchema } from './schemas'

export type HealthResponse = z.infer<typeof healthResponseSchema>
