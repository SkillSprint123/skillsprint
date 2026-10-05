import { z } from 'zod'

import { appSectionSchema } from '../../app/router/schemas'

export const nanoPagePropsSchema = appSectionSchema
  .pick({ title: true, description: true })
  .extend({ nanoId: z.string().min(1), basePath: z.string().min(1) })
