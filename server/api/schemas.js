const { z } = require('zod')

const healthResponseSchema = z.object({
  service: z.literal('skillsprint'),
  version: z.string().min(1),
  status: z.literal('ok'),
})

module.exports = { healthResponseSchema }
