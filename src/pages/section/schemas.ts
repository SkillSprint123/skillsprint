import { appSectionSchema } from '../../app/router/schemas'

export const sectionPagePropsSchema = appSectionSchema.pick({
  title: true,
  description: true,
})
