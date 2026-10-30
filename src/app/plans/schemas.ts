import { z } from 'zod'

export const planIdSchema = z.enum(['free', 'pro', 'ultimate'])
export const planSchema = z.object({
  id: planIdSchema,
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  description: z.string().min(1),
  label: z.string().min(1),
  features: z.array(z.string().min(1)).min(1),
  featured: z.boolean().default(false),
})
export const plansSchema = z
  .array(planSchema)
  .length(3)
  .refine(
    (plans) => new Set(plans.map((plan) => plan.id)).size === 3,
    'Each plan must be unique',
  )
