import { readFile } from 'node:fs/promises'
import { resolve, relative, isAbsolute } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import sources from '../../config/schemas.js'

export const projectRoot = fileURLToPath(new URL('../../', import.meta.url))
/** @param {string} name */
export const option = (name, fallback = '') => {
  const index = process.argv.indexOf(name)
  if (index < 0) return fallback
  const value = process.argv[index + 1]
  if (!value || value.startsWith('--'))
    throw new Error(`Нужно значение ${name}`)
  return value
}

export const readSources = async (
  filename = option(
    '--config',
    process.env.NANO_SOURCES || 'config/nano-sources.json',
  ),
) =>
  sources.nanoSourcesSchema.parse(
    JSON.parse(await readFile(resolve(projectRoot, filename), 'utf8')),
  )

/** @type {import('./types').RunCommand} */
export const run = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.error) throw result.error
  if (result.status !== 0)
    throw new Error(
      `${command} завершился с ошибкой (${result.status ?? result.signal})`,
    )
  return result.stdout?.trim() || ''
}

/** @param {string} parent @param {string} child */
export const within = (parent, child) => {
  const filename = resolve(parent, child)
  const rel = relative(parent, filename)
  if (rel === '..' || rel.startsWith('../') || isAbsolute(rel))
    throw new Error('Путь выходит за разрешённый каталог')
  return filename
}

/** @param {import('../../config/types').NanoSources} config */
export const requireAll = (config) => {
  const missing = sources.nanoIdSchema.options.filter(
    (id) => config.nanos[id].source?.kind !== 'git',
  )
  if (missing.length)
    throw new Error(
      `Для полного выпуска нужны Git-источники: ${missing.join(', ')}`,
    )
}

/** @param {string} id @param {import('../../config/types').NanoSource} nano */
export const sourceDirectory = (id, nano, base = projectRoot) => {
  if (!nano.source) throw new Error(`Источник ${id} не настроен`)
  return nano.source.kind === 'local'
    ? within(base, nano.source.directory)
    : within(base, `.nano-work/checkouts/${id}`)
}
