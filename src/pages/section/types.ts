import type { z } from 'zod'

import type { sectionPagePropsSchema } from './schemas'

export type SectionPageProps = z.infer<typeof sectionPagePropsSchema>
