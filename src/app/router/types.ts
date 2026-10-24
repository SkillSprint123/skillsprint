import type { z } from 'zod'

import type { appSectionsSchema } from './schemas'

export type AppSections = z.infer<typeof appSectionsSchema>
