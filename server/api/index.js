const { Router } = require('express')
const { version } = require('../../package.json')
const { healthResponseSchema } = require('./schemas')

const router = Router()

router.get('/health', (_req, res) => {
  /** @type {import('./types').HealthResponse} */
  const response = healthResponseSchema.parse({
    service: 'skillsprint',
    version,
    status: 'ok',
  })
  res.json(response)
})

// Серверная интеграция GigaChat добавляется здесь при реализации interview.
// brojs dev/prom подключают этот Router на /api. Секреты остаются на сервере.
module.exports = router
