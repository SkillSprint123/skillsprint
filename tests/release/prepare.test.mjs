import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import { prepareSources } from '../../scripts/release/prepare.mjs'
import { readSources } from '../../scripts/release/common.mjs'

test('source preparation pins commits, checks before building, and does not record failed releases', async () => {
  const base = await mkdtemp(resolve(tmpdir(), 'skillsprint-prepare-test-'))
  try {
    const config = await readSources()
    const commit = 'a'.repeat(40)
    config.nanos.trainer.source = {
      kind: 'git',
      url: 'git@bitbucket.org:team/trainer.git',
      ref: commit,
    }
    const calls = []
    const execute = (command, args) => {
      calls.push([command, ...args])
      if (args[0] === 'clone') {
        const directory = args.at(-1)
        mkdirSync(directory, { recursive: true })
        writeFileSync(
          resolve(directory, 'package.json'),
          JSON.stringify({ version: '0.1.0' }),
        )
      }
      return args[0] === 'rev-parse' ? commit : ''
    }
    const lock = await prepareSources(config, execute, base)
    assert.equal(lock.trainer.commit, commit)
    assert.deepEqual(calls.slice(-3), [
      ['npm', 'ci'],
      ['npm', 'run', 'check'],
      ['npm', 'run', 'build:prod'],
    ])
    assert.ok(
      calls.some(
        (args) =>
          args[0] === 'git' && args[1] === 'checkout' && args[2] === '--detach',
      ),
    )
    await assert.rejects(
      () =>
        prepareSources(
          config,
          (command, args, cwd) => {
            if (command === 'npm' && args[1] === 'check')
              throw new Error('Checks failed')
            return execute(command, args, cwd)
          },
          base,
        ),
      /Checks failed/,
    )
    await assert.rejects(
      () => readFile(resolve(base, '.nano-work/sources-lock.json')),
      /ENOENT/,
    )
  } finally {
    await rm(base, { recursive: true, force: true })
  }
})
