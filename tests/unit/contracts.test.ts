import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  assertNanoContext,
  assertNanoInstance,
  assertNanoModule,
  assertNanoRegistry,
  nanoElementSchema,
} from '../../packages/contracts/src'
import type { NanoModule } from '../../packages/contracts/src/types'

test('контракт принимает синхронное и асинхронное подключение', async () => {
  let cleanups = 0
  const instance = {
    unmount: () => {
      cleanups += 1
    },
  }
  for (const mount of [() => instance, async () => instance]) {
    const module: NanoModule = { contractVersion: 1, mount }
    assertNanoModule(module)
    const result = await module.mount({} as HTMLElement, {
      basePath: '/skillsprint/trainer',
      apiBaseUrl: '/api',
      user: null,
      navigate: () => {},
    })
    assertNanoInstance(result)
    await result.unmount()
  }
  assert.equal(cleanups, 2)
})

test('несовместимая версия отклоняется без вызова mount', () => {
  let called = false
  assert.throws(
    () =>
      assertNanoModule({
        contractVersion: 2,
        mount: () => {
          called = true
        },
      }),
    /Несовместимый/,
  )
  assert.equal(called, false)
})

test('загрузчик должен отвергать некорректные экспорты и отсутствие очистки', () => {
  for (const value of [
    null,
    undefined,
    {},
    { contractVersion: 1 },
    { contractVersion: 1, mount: 'mount' },
  ]) {
    assert.throws(() => assertNanoModule(value))
  }
  for (const value of [null, undefined, {}, { unmount: true }]) {
    assert.throws(() => assertNanoInstance(value))
  }
  assertNanoInstance({ unmount: async () => {} })
})

test('assert-проверки сохраняют функции и их контекст this', () => {
  const instance = {
    count: 0,
    unmount() {
      this.count += 1
    },
  }
  const originalUnmount = instance.unmount
  assertNanoInstance(instance)
  assert.equal(instance.unmount, originalUnmount)
  instance.unmount()
  assert.equal(instance.count, 1)
  const module = { contractVersion: 1, mount: () => instance }
  const originalMount = module.mount
  assertNanoModule(module)
  assert.equal(module.mount, originalMount)
})

test('контекст проверяет пользователя и navigate; DOM-схема безопасна без браузера', () => {
  const context = {
    basePath: '/skillsprint/trainer',
    apiBaseUrl: '/api',
    user: null,
    navigate: () => {},
  }
  assertNanoContext(context)
  assertNanoContext({ ...context, user: { id: '1', displayName: 'Студент' } })
  assert.throws(() => assertNanoContext({ ...context, navigate: true }))
  assert.throws(() => assertNanoContext({ ...context, user: { id: 1 } }))
  assert.equal(nanoElementSchema.safeParse({}).success, false)
})

test('реестр принимает v1 и отвергает несовместимые версии и неполные записи', () => {
  const entry = {
    version: '1.2.0',
    contractVersion: 1,
    entry: './trainer/index.js',
    styles: [],
  }
  assertNanoRegistry({ schemaVersion: 1, nanos: { trainer: entry } })
  for (const value of [
    { schemaVersion: 2, nanos: {} },
    { schemaVersion: 1, nanos: { trainer: { ...entry, contractVersion: 2 } } },
    { schemaVersion: 1, nanos: { trainer: { ...entry, version: 'latest' } } },
    { schemaVersion: 1, nanos: { trainer: { ...entry, entry: '' } } },
    { schemaVersion: 1, nanos: { trainer: { ...entry, styles: [123] } } },
  ])
    assert.throws(() => assertNanoRegistry(value))
})
