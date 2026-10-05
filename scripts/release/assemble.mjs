import {
  cp,
  mkdir,
  readFile,
  readdir,
  lstat,
  writeFile,
  rm,
  realpath,
} from 'node:fs/promises'
import { resolve, relative, extname } from 'node:path'
import { pathToFileURL } from 'node:url'

import contract from '../../packages/contracts/dist/index.js'
import sourceSchemas from '../../config/schemas.js'
import {
  option,
  readSources,
  projectRoot,
  requireAll,
  run,
  sourceDirectory,
  within,
} from './common.mjs'

/** @param {string} directory */
export const checkArtifact = async (directory) => {
  if ((await lstat(directory)).isSymbolicLink())
    throw new Error('Ссылки в артефакте запрещены')
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (item.isSymbolicLink())
      throw new Error(`Ссылка в артефакте: ${item.name}`)
    if (
      /^(\.env(?:\..*)?|\.git|\.npmrc|node_modules|id_rsa|id_ed25519)$/.test(
        item.name,
      ) ||
      /\.(?:key|p12|pfx)$/.test(item.name)
    ) {
      throw new Error(`В артефакте найден непубликуемый файл: ${item.name}`)
    }
    if (item.isDirectory()) await checkArtifact(resolve(directory, item.name))
    else if (!item.isFile()) throw new Error(`Недопустимый файл: ${item.name}`)
  }
}

/** @param {string} directory @param {string} file */
export const checkFile = async (directory, file) => {
  const filename = within(directory, file)
  if (!(await lstat(filename)).isFile())
    throw new Error(`Не найден файл ${file}`)
  within(
    await realpath(directory),
    relative(await realpath(directory), await realpath(filename)),
  )
}

/** @param {import('../../config/types').NanoSources} config
 * @param {string} output */
export const assemble = async (config, output) => {
  const target = within(projectRoot, output)
  // Итоговый каталог — только dist или его вложенный каталог.
  within(
    resolve(projectRoot, 'dist'),
    relative(resolve(projectRoot, 'dist'), target),
  )
  await mkdir(target, { recursive: true })
  await rm(resolve(target, 'nanos'), { recursive: true, force: true })
  await rm(resolve(target, 'nanos.json'), { force: true })
  /** @type {import('../../packages/contracts/src').NanoRegistry} */
  const registry = { schemaVersion: 1, nanos: {} }
  /** @type {import('../../config/types').SourceLock} */
  let lock = {}
  if (Object.values(config.nanos).some((nano) => nano.source?.kind === 'git')) {
    lock = sourceSchemas.sourceLockSchema.parse(
      JSON.parse(
        await readFile(
          resolve(projectRoot, '.nano-work/sources-lock.json'),
          'utf8',
        ),
      ),
    )
  }
  for (const [id, nano] of Object.entries(config.nanos)) {
    if (!nano.source) {
      console.log(`${id}: источник пока не подключён`)
      continue
    }
    const checkout = sourceDirectory(id, nano)
    if (nano.source.kind === 'git') {
      const pinned = lock[id]
      if (
        !pinned ||
        pinned.url !== nano.source.url ||
        pinned.ref !== nano.source.ref ||
        pinned.version !== nano.version ||
        run('git', ['rev-parse', 'HEAD'], checkout) !== pinned.commit
      ) {
        throw new Error(
          `Сборка ${id} устарела: сначала выполните nanos:prepare`,
        )
      }
    }
    const directory = within(checkout, nano.output)
    const realDirectory = await realpath(directory)
    within(
      await realpath(checkout),
      relative(await realpath(checkout), realDirectory),
    )
    if (!['.js', '.mjs'].includes(extname(nano.entry)))
      throw new Error(`Точка входа ${id} должна быть JS-модулем`)
    await checkArtifact(directory)
    await checkFile(directory, nano.entry)
    for (const style of nano.styles) await checkFile(directory, style)
    const prefix = `nanos/${id}/${nano.version}`
    await cp(directory, resolve(target, prefix), { recursive: true })
    registry.nanos[id] = {
      version: nano.version,
      contractVersion: 1,
      entry: `./${prefix}/${nano.entry}`,
      styles: nano.styles.map((style) => `./${prefix}/${style}`),
    }
  }
  contract.assertNanoRegistry(registry)
  await writeFile(
    resolve(target, 'nanos.json'),
    `${JSON.stringify(registry, null, 2)}\n`,
  )
  // Только provenance выбранного выпуска; SSH-адреса и refs не нужны браузеру.
  const pkg = JSON.parse(
    await readFile(resolve(projectRoot, 'package.json'), 'utf8'),
  )
  const receipt = sourceSchemas.releaseReceiptSchema.parse({
    schemaVersion: 1,
    rootVersion: process.env.VERSION || pkg.version,
    nanos: Object.fromEntries(
      Object.entries(registry.nanos).map(([id, entry]) => [
        id,
        {
          version: entry.version,
          commit: lock[id]?.commit ?? null,
        },
      ]),
    ),
  })
  await writeFile(
    resolve(target, 'release.json'),
    `${JSON.stringify(receipt, null, 2)}\n`,
  )
  return registry
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const config = await readSources()
    if (process.argv.includes('--require-all')) requireAll(config)
    if (process.argv.includes('--root-only')) {
      for (const nano of Object.values(config.nanos)) nano.source = null
    }
    await assemble(config, option('--out', 'dist'))
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
