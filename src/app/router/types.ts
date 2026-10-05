import type { z } from 'zod'

import type { appSectionSchema, appSectionsSchema } from './schemas'

export type AppSection = z.infer<typeof appSectionSchema>
export type AppSections = z.infer<typeof appSectionsSchema>
