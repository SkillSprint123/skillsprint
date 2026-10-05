import type { z } from 'zod'

import type { nanoPagePropsSchema } from './schemas'

export type NanoPageProps = z.infer<typeof nanoPagePropsSchema>
