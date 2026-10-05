import { z } from 'zod'

export const nanoUserSchema = z.object({
  id: z.string(),
  displayName: z.string(),
})

export const nanoContextSchema = z.object({
  basePath: z.string(),
  apiBaseUrl: z.string(),
  user: nanoUserSchema.nullable(),
  navigate: z.function().args(z.string()).returns(z.void()),
})

// Нативный DOM-тип; проверка откладывается до вызова схемы и учитывает realm.
export const nanoElementSchema = z.custom<HTMLElement>(
  (value: unknown) => {
    if (
      typeof value !== 'object' ||
      value === null ||
      !('ownerDocument' in value)
    )
      return false
    const element = value as HTMLElement
    const constructor = element.ownerDocument?.defaultView?.HTMLElement
    return Boolean(constructor && element instanceof constructor)
  },
  { message: 'Ожидается DOM-контейнер HTMLElement' },
)

export const nanoInstanceSchema = z.object({
  unmount: z
    .function()
    .args()
    .returns(z.union([z.void(), z.promise(z.void())])),
})

export const nanoModuleSchema = z.object({
  contractVersion: z.literal(1),
  mount: z
    .function()
    .args(nanoElementSchema, nanoContextSchema)
    .returns(z.union([nanoInstanceSchema, z.promise(nanoInstanceSchema)])),
})

export const nanoRegistryEntrySchema = z.object({
  version: z
    .string()
    .regex(
      /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/,
      'Нужна фиксированная версия, например 1.2.0',
    ),
  contractVersion: z.literal(1),
  entry: z.string().min(1),
  styles: z.array(z.string().min(1)),
})

export const nanoRegistrySchema = z.object({
  schemaVersion: z.literal(1),
  nanos: z.record(nanoRegistryEntrySchema),
})
