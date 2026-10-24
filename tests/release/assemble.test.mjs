import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  symlink,
} from 'node:fs/promises'
import { resolve, relative } from 'node:path'
import { spawnSync } from 'node:child_process'

import schemas from '../../config/schemas.js'
import { assemble, checkArtifact } from '../../scripts/release/assemble.mjs'
import {
  projectRoot,
  requireAll,
  within,
} from '../../scripts/release/common.mjs'
import { createSources } from './fixtures.mjs'

test('release configuration requires four entries, a pinned ref, and safe paths', () => {
  const config = createSources()
  assert.ok(schemas.nanoSourcesSchema.safeParse(config).success)
  assert.throws(
    () => requireAll(config),
    /learning-plan.*trainer.*interview.*progress/,
  )
  delete config.nanos.trainer
  assert.equal(schemas.nanoSourcesSchema.safeParse(config).success, false)
  for (const ref of ['main', 'latest', '--upload-pack=bad']) {
    const changed = createSources()
    changed.nanos.trainer.source = {
      kind: 'git',
      url: 'git@bitbucket.org:team/trainer.git',
      ref,
    }
    assert.equal(schemas.nanoSourcesSchema.safeParse(changed).success, false)
  }
  for (const output of ['../src', '/etc', 'dist/../../src']) {
    const changed = createSources()
    changed.nanos.trainer.output = output
    assert.equal(schemas.nanoSourcesSchema.safeParse(changed).success, false)
  }
  assert.throws(() => within('/tmp/a', '../b'))
})

test('full releases report only missing Git sources and accept fully configured sources', () => {
  const config = createSources()
  config.nanos.interview.source = {
    kind: 'git',
    url: 'git@bitbucket.org:team/interview.git',
    ref: 'refs/tags/v0.1.0',
  }
  assert.throws(() => requireAll(config), {
    message:
      'A full release requires Git sources: learning-plan, trainer, progress',
  })
  for (const id of ['learning-plan', 'trainer', 'progress']) {
    config.nanos[id].source = {
      kind: 'git',
      url: `git@bitbucket.org:team/${id}.git`,
      ref: 'a'.repeat(40),
    }
  }
  assert.doesNotThrow(() => requireAll(schemas.nanoSourcesSchema.parse(config)))
})

test('assembly preserves the root, copies chunks, and produces a valid registry', async () => {
  await mkdir(resolve(projectRoot, '.nano-work'), { recursive: true })
  await mkdir(resolve(projectRoot, 'dist'), { recursive: true })
  const source = await mkdtemp(
    resolve(projectRoot, '.nano-work/assembly-test-'),
  )
  const output = await mkdtemp(resolve(projectRoot, 'dist/assembly-test-'))
  try {
    await writeFile(resolve(output, 'index.js'), 'root bundle')
    await writeFile(
      resolve(source, 'index.js'),
      'export const contractVersion = 1',
    )
    await mkdir(resolve(source, 'assets'))
    await writeFile(
      resolve(source, 'assets/chunk.js'),
      'export const answer = 42',
    )
    const config = createSources()
    config.nanos.trainer.source = {
      kind: 'local',
      directory: relative(projectRoot, source),
    }
    config.nanos.trainer.output = '.'
    const registry = await assemble(
      schemas.nanoSourcesSchema.parse(config),
      relative(projectRoot, output),
    )
    assert.equal(
      await readFile(resolve(output, 'index.js'), 'utf8'),
      'root bundle',
    )
    assert.equal(registry.nanos.trainer.entry, './nanos/trainer/0.1.0/index.js')
    assert.equal(
      await readFile(
        resolve(output, 'nanos/trainer/0.1.0/assets/chunk.js'),
        'utf8',
      ),
      'export const answer = 42',
    )
    assert.deepEqual(
      JSON.parse(await readFile(resolve(output, 'nanos.json'), 'utf8')),
      registry,
    )
    await writeFile(resolve(source, '.env.production'), 'secret=example')
    await assert.rejects(
      () => assemble(config, relative(projectRoot, output)),
      /Non-publishable/,
    )
    await assert.rejects(
      () => readFile(resolve(output, 'nanos.json')),
      /ENOENT/,
    )
    await rm(resolve(source, '.env.production'))
    await symlink(resolve(source, 'index.js'), resolve(source, 'linked.js'))
    await assert.rejects(() => checkArtifact(source), /Symbolic link/)
  } finally {
    await rm(source, { recursive: true, force: true })
    await rm(output, { recursive: true, force: true })
  }
})

test('full release mode fails when sources are not configured', async () => {
  await mkdir(resolve(projectRoot, '.nano-work'), { recursive: true })
  const workspace = await mkdtemp(resolve(projectRoot, '.nano-work/full-test-'))
  try {
    const configFile = resolve(workspace, 'sources.json')
    await writeFile(configFile, JSON.stringify(createSources()))
    const result = spawnSync(
      process.execPath,
      ['scripts/release/prepare.mjs', '--require-all', '--config', configFile],
      { cwd: projectRoot, encoding: 'utf8' },
    )
    assert.equal(result.status, 1)
    assert.match(result.stderr, /A full release requires Git sources/)
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }
})

test('root-only mode does not require checkouts of configured Git sources', async () => {
  await mkdir(resolve(projectRoot, '.nano-work'), { recursive: true })
  await mkdir(resolve(projectRoot, 'dist'), { recursive: true })
  const workspace = await mkdtemp(resolve(projectRoot, '.nano-work/root-test-'))
  const output = await mkdtemp(resolve(projectRoot, 'dist/root-test-'))
  try {
    const config = createSources()
    config.nanos.trainer.source = {
      kind: 'git',
      url: 'git@bitbucket.org:team/trainer.git',
      ref: 'a'.repeat(40),
    }
    const configFile = resolve(workspace, 'sources.json')
    await writeFile(configFile, JSON.stringify(config))
    const result = spawnSync(
      process.execPath,
      [
        'scripts/release/assemble.mjs',
        '--root-only',
        '--config',
        configFile,
        '--out',
        relative(projectRoot, output),
      ],
      { cwd: projectRoot, encoding: 'utf8' },
    )
    assert.equal(result.status, 0, result.stderr)
    assert.deepEqual(
      JSON.parse(await readFile(resolve(output, 'nanos.json'), 'utf8')),
      { schemaVersion: 1, nanos: {} },
    )
  } finally {
    await rm(workspace, { recursive: true, force: true })
    await rm(output, { recursive: true, force: true })
  }
})
