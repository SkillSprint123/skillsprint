import { z } from 'zod'

export const appSectionSchema = z.object({
  path: z.enum(['plan', 'trainer', 'interview', 'progress', 'pro']),
  title: z.string().min(1),
  description: z.string().min(1),
  nanoId: z
    .enum(['learning-plan', 'trainer', 'interview', 'progress'])
    .optional(),
})

export const appSectionsSchema = z
  .array(appSectionSchema)
  .refine(
    (sections) =>
      new Set(sections.map(({ path }) => path)).size === sections.length,
    {
      message: 'Маршруты разделов должны быть уникальными',
    },
  )
