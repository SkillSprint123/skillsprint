import type { z } from 'zod'

import type { appConfigSchema } from './schemas'

export type AppConfig = z.infer<typeof appConfigSchema>
