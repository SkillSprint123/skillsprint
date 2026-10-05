const { z } = require('zod')

const relativePathSchema = z
  .string()
  .min(1)
  .refine(
    (value) =>
      !value.startsWith('/') &&
      !value.includes('\\') &&
      !value.split('/').includes('..') &&
      !value.includes('\0'),
    'Use a relative path that stays inside the directory',
  )

const gitSourceSchema = z
  .object({
    kind: z.literal('git'),
    url: z
      .string()
      .regex(
        /^git@[a-zA-Z0-9.-]+:[a-zA-Z0-9_./-]+\.git$/,
        'An SSH Git repository URL is required',
      ),
    ref: z
      .string()
      .regex(
        /^(?:[a-f0-9]{40}|refs\/tags\/[a-zA-Z0-9][a-zA-Z0-9._/-]*)$/,
        'Specify a commit SHA or refs/tags/<tag>',
      ),
  })
  .strict()

const localSourceSchema = z
  .object({ kind: z.literal('local'), directory: relativePathSchema })
  .strict()
const nanoIdSchema = z.enum([
  'learning-plan',
  'trainer',
  'interview',
  'progress',
])
const nanoSourceSchema = z
  .object({
    version: z
      .string()
      .regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/),
    source: z
      .discriminatedUnion('kind', [gitSourceSchema, localSourceSchema])
      .nullable(),
    scripts: z
      .object({
        check: z.string().regex(/^[a-zA-Z0-9:_-]+$/),
        build: z.string().regex(/^[a-zA-Z0-9:_-]+$/),
      })
      .strict(),
    output: relativePathSchema,
    entry: relativePathSchema,
    styles: z.array(relativePathSchema),
  })
  .strict()
const nanoSourcesSchema = z
  .object({
    schemaVersion: z.literal(1),
    nanos: z.record(nanoSourceSchema),
  })
  .strict()
  .superRefine((value, ctx) => {
    for (const id of nanoIdSchema.options) {
      if (!value.nanos[id])
        ctx.addIssue({
          code: 'custom',
          path: ['nanos', id],
          message: 'Add a module entry',
        })
    }
    for (const id of Object.keys(value.nanos)) {
      if (!nanoIdSchema.safeParse(id).success)
        ctx.addIssue({
          code: 'custom',
          path: ['nanos', id],
          message: 'Unknown module',
        })
    }
  })

const sourceLockSchema = z.record(
  z
    .object({
      version: nanoSourceSchema.shape.version,
      url: gitSourceSchema.shape.url,
      ref: gitSourceSchema.shape.ref,
      commit: z.string().regex(/^[a-f0-9]{40}$/),
    })
    .strict(),
)

const releaseReceiptSchema = z
  .object({
    schemaVersion: z.literal(1),
    rootVersion: z.string().min(1),
    nanos: z.record(
      z
        .object({
          version: nanoSourceSchema.shape.version,
          commit: z
            .string()
            .regex(/^[a-f0-9]{40}$/)
            .nullable(),
        })
        .strict(),
    ),
  })
  .strict()

module.exports = {
  nanoIdSchema,
  nanoSourcesSchema,
  sourceLockSchema,
  releaseReceiptSchema,
}
