import { z } from 'zod'
import { planIdSchema } from '../plans/schemas'

export const profileFieldsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Укажи, как к тебе обращаться.')
    .max(80, 'Не больше 80 символов.'),
  email: z.union([
    z.literal(''),
    z.string().trim().email('Проверь адрес почты.').max(254),
  ]),
  role: z.string().trim().max(80, 'Не больше 80 символов.'),
  level: z.enum(['beginner', 'junior', 'middle', 'senior']),
  goal: z.string().trim().max(300, 'Не больше 300 символов.'),
  avatar: z.enum(['blue', 'teal', 'amber', 'slate']),
})
export const accountProfileSchema = profileFieldsSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
})
export const accountStateSchema = z.object({
  schemaVersion: z.literal(1),
  mode: z.literal('demo'),
  signedIn: z.boolean(),
  plan: planIdSchema.default('free'),
  profile: accountProfileSchema,
})
export const loginDetailsSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().optional(),
})
export const returnLocationSchema = z.object({ from: z.string() })
