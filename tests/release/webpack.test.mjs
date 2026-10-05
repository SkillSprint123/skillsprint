import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import webpack from 'webpack'

import NanoRegistryPlugin from '../../scripts/webpack-plugin.cjs'

test('compilation errors return a nonzero exit code even if BroJS reports success', async () => {
  const directory = await mkdtemp(
    resolve(tmpdir(), 'skillsprint-webpack-test-'),
  )
  const previous = process.exitCode
  try {
    await writeFile(
      resolve(directory, 'index.js'),
      'import "./missing-module.js"',
    )
    const compiler = webpack({
      mode: 'production',
      entry: resolve(directory, 'index.js'),
      output: { path: resolve(directory, 'dist') },
      plugins: [new NanoRegistryPlugin()],
    })
    const stats = await new Promise((accept, reject) => {
      compiler.run((error, result) =>
        compiler.close((closeError) => {
          if (error || closeError) reject(error || closeError)
          else accept(result)
        }),
      )
    })
    assert.equal(stats.hasErrors(), true)
    assert.equal(process.exitCode, 1)
  } finally {
    process.exitCode = previous
    await rm(directory, { recursive: true, force: true })
  }
})
