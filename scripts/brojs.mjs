import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import { pathToFileURL } from 'node:url'

// BroJS 2 has no CLI locale setting. Keep translations outside node_modules.
const messages = [
  ['Запуск сборки в режиме ', 'Starting build in mode '],
  ['Ошибка сборки:', 'Build failed:'],
  ['Сборка успешно завершена!', 'Build completed successfully!'],
  [
    'Не найден элемент с id "app" для SPA-компиляции',
    'Element with id "app" not found for SPA compilation',
  ],
  ['Компиляция SPA в ', 'Compiling SPA into '],
  ['Ошибка компиляции:', 'Compilation failed:'],
  ['Webpack завершился с ошибкой', 'Webpack compilation failed'],
  ['Предупреждения:', 'Warnings:'],
  ['SPA успешно собран!', 'SPA compiled successfully!'],
  ['скриптов', 'scripts'],
  ['стилей', 'styles'],
  [
    'Не удалось прочитать htmlTemplatePath, используется дефолтный шаблон:',
    'Could not read htmlTemplatePath; using the default template:',
  ],
  ['Не найден manifest по пути ', 'Manifest not found at '],
  [
    '. Выполните "brojs compile" перед запуском prom-сервера.',
    '. Run "npm run compile" before starting the preview server.',
  ],
  ['Prom-сервер запущен', 'Preview server started'],
  ['Dev-сервер не запустился', 'Development server failed to start'],
  ['Компиляция завершилась с ошибкой', 'Compilation failed'],
  ['Prom-сервер не запустился', 'Preview server failed to start'],
  ['Сервер запущен!', 'Development server started!'],
  ['Открыть:', 'Open:'],
  ['API обновлен', 'API updated'],
  ['Изменения успешно применены!', 'Changes applied successfully!'],
]

/** @param {string} message */
export const translateBrojsMessage = (message) =>
  messages
    .reduce(
      (output, [source, translation]) => output.replaceAll(source, translation),
      message,
    )
    .replace(/\b1 scripts\b/g, '1 script')
    .replace(/\b1 styles\b/g, '1 style')

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const require = createRequire(import.meta.url)
  const cli = resolve(
    dirname(require.resolve('@brojs/cli/package.json')),
    'bin/cli.js',
  )
  const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: {
      ...process.env,
      FORCE_COLOR:
        process.env.FORCE_COLOR ?? (process.stdout.isTTY ? '1' : '0'),
    },
  })
  if (child.stdout) {
    createInterface({ input: child.stdout, crlfDelay: Infinity }).on(
      'line',
      (line) => process.stdout.write(`${translateBrojsMessage(line)}\n`),
    )
  }
  if (child.stderr) {
    createInterface({ input: child.stderr, crlfDelay: Infinity }).on(
      'line',
      (line) => process.stderr.write(`${translateBrojsMessage(line)}\n`),
    )
  }
  const interrupt = () => child.kill('SIGINT')
  const terminate = () => child.kill('SIGTERM')
  process.on('SIGINT', interrupt)
  process.on('SIGTERM', terminate)
  child.on('error', (error) => {
    console.error(error)
    process.exitCode = 1
  })
  child.on('close', (code, signal) => {
    process.off('SIGINT', interrupt)
    process.off('SIGTERM', terminate)
    process.exitCode = code ?? (signal === 'SIGINT' ? 130 : 1)
  })
}
