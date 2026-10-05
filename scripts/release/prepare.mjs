import { mkdir, rm, readFile, writeFile, access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  readSources,
  projectRoot,
  requireAll,
  run,
  sourceDirectory,
} from './common.mjs'

/** @param {import('../../config/types').NanoSources} config
 * @param {import('./types').RunCommand} execute
 * @param {string} base */
export const prepareSources = async (
  config,
  execute = run,
  base = projectRoot,
) => {
  const workspace = resolve(base, '.nano-work')
  await mkdir(workspace, { recursive: true })
  await rm(resolve(workspace, 'sources-lock.json'), { force: true })
  /** @type {import('../../config/types').SourceLock} */
  const lock = {}
  for (const [id, nano] of Object.entries(config.nanos)) {
    if (!nano.source) continue
    const directory = sourceDirectory(id, nano, base)
    if (nano.source.kind === 'local') {
      await access(directory)
      continue
    }
    await rm(directory, { recursive: true, force: true })
    await mkdir(resolve(workspace, 'checkouts'), { recursive: true })
    execute(
      'git',
      ['clone', '--no-checkout', '--', nano.source.url, directory],
      base,
    )
    execute('git', ['fetch', '--depth=1', 'origin', nano.source.ref], directory)
    execute('git', ['checkout', '--detach', 'FETCH_HEAD'], directory)
    const commit = execute('git', ['rev-parse', 'HEAD'], directory)
    if (!/^[a-f0-9]{40}$/.test(commit))
      throw new Error(`Не удалось определить commit ${id}`)
    if (/^[a-f0-9]{40}$/.test(nano.source.ref) && commit !== nano.source.ref)
      throw new Error(`Неверный commit ${id}`)
    const pkg = JSON.parse(
      await readFile(resolve(directory, 'package.json'), 'utf8'),
    )
    if (pkg.version !== nano.version)
      throw new Error(`Версия ${id} отличается от состава выпуска`)
    execute('npm', ['ci'], directory)
    execute('npm', ['run', nano.scripts.check], directory)
    execute('npm', ['run', nano.scripts.build], directory)
    lock[id] = {
      version: nano.version,
      url: nano.source.url,
      ref: nano.source.ref,
      commit,
    }
  }
  await writeFile(
    resolve(workspace, 'sources-lock.json'),
    `${JSON.stringify(lock, null, 2)}\n`,
  )
  return lock
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const config = await readSources()
    if (process.argv.includes('--require-all')) requireAll(config)
    await prepareSources(config)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
