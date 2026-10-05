import assert from 'node:assert/strict'
import { test } from 'node:test'

import { basePathSchema, featureFlagSchema } from '../../src/app/config/schemas'
import { parseAppConfig } from '../../src/app/config/parse'
import { joinRoute } from '../../src/app/router/paths'
import { appSectionsSchema } from '../../src/app/router/schemas'

test('AI выключен при false, отсутствии или некорректном значении флага', () => {
  for (const value of ['false', false, undefined, null, '', 'yes', 1]) {
    assert.equal(featureFlagSchema.parse(value), false)
  }
  assert.equal(featureFlagSchema.parse('true'), true)
  assert.equal(featureFlagSchema.parse(true), true)
})

test('маршруты корректны при другом префиксе стенда и корневом пути', () => {
  assert.equal(basePathSchema.parse(undefined), '/skillsprint')
  assert.equal(
    joinRoute(basePathSchema.parse('/stand/skillsprint/'), 'plan'),
    '/stand/skillsprint/plan',
  )
  assert.equal(joinRoute(basePathSchema.parse('/'), 'trainer'), '/trainer')
})

test('Zod проверяет конфигурацию и применяет безопасные значения по умолчанию', () => {
  const config = parseAppConfig({ version: '0.1.0', features: {} })
  assert.equal(config.features.aiInterview, false)
  assert.equal(config.apiBaseUrl, '/api')
  assert.equal(config.basePath, '/skillsprint')
  assert.throws(() => parseAppConfig({ version: 1, features: {} }))
  assert.throws(() =>
    parseAppConfig({ version: '0.1.0', apiBaseUrl: 123, features: {} }),
  )
})

test('схема разделов отвергает неизвестные и повторяющиеся маршруты', () => {
  const section = { path: 'plan', title: 'План', description: 'Задачи на день' }
  assert.equal(appSectionsSchema.safeParse([section]).success, true)
  assert.equal(appSectionsSchema.safeParse([section, section]).success, false)
  assert.equal(
    appSectionsSchema.safeParse([{ ...section, path: 'unknown' }]).success,
    false,
  )
})
