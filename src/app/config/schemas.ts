import {z} from 'zod'

// Строка "false" не должна включать feature toggle.
export const featureFlagSchema = z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((value) => value === true || value === 'true')
    .catch(false)

export const basePathSchema = z
    .string()
    .refine((value) => value === '' || value.startsWith('/'))
    .optional()
    .transform((value) => (value || '/skillsprint').replace(/\/+$/, '') || '/')
    .catch('/skillsprint')

export const appConfigSchema = z.object({
    basePath: basePathSchema,
    apiBaseUrl: z.string().min(1).default('/api'),
    registryUrl: z.string().default(''),
    version: z.string().min(1),
    features: z.object({
        aiInterview: featureFlagSchema,
    }),
})
