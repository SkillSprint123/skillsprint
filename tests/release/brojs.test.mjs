import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'

import { translateBrojsMessage } from '../../scripts/brojs.mjs'
import { projectRoot } from '../../scripts/release/common.mjs'

test('BroJS translation preserves ANSI formatting, paths, and diagnostics', () => {
  const messages = [
    [
      'Запуск сборки в режиме \u001b[32mproduction\u001b[39m...',
      'Starting build in mode \u001b[32mproduction\u001b[39m...',
    ],
    [
      'Не найден manifest по пути /tmp/assets.json. Выполните "brojs compile" перед запуском prom-сервера.',
      'Manifest not found at /tmp/assets.json. Run "npm run compile" before starting the preview server.',
    ],
    ['(2 скриптов, 0 стилей)', '(2 scripts, 0 styles)'],
    ['(1 скриптов, 1 стилей)', '(1 script, 1 style)'],
    [
      'WARNING in asset size limit: 313 KiB',
      'WARNING in asset size limit: 313 KiB',
    ],
    [
      'Compilation error: /src/index.tsx:12',
      'Compilation error: /src/index.tsx:12',
    ],
  ]
  for (const [source, translated] of messages) {
    assert.equal(translateBrojsMessage(source), translated)
  }
})

test('the BroJS wrapper preserves successful and failing CLI exit codes', () => {
  const invoke = (argument) =>
    spawnSync(process.execPath, ['scripts/brojs.mjs', argument], {
      cwd: projectRoot,
      encoding: 'utf8',
    })
  const success = invoke('--version')
  assert.equal(success.status, 0, success.stderr)
  assert.match(success.stdout, /^2\.\d+\.\d+/)
  const failure = invoke('unsupported-command')
  assert.equal(failure.status, 1)
  assert.match(failure.stderr, /unknown command/)
})
