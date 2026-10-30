import { spawn } from 'node:child_process'
import { access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const interview = resolve(
  root,
  process.env.INTERVIEW_DIR || '../skillsprint-ai',
)
/** @type {import('./types').ChildProcess[]} */
const children = []
let stopping = false

/** @param {import('./types').ChildProcess} child
 * @param {NodeJS.Signals} signal */
const kill = (child, signal) => {
  if (!child.pid) return
  try {
    if (process.platform === 'win32') child.kill(signal)
    else process.kill(-child.pid, signal)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ESRCH')
      return
    console.error(error)
  }
}

/** @param {number} code */
const stop = (code) => {
  if (stopping) return
  stopping = true
  process.exitCode = code
  for (const child of children) kill(child, 'SIGTERM')
  // Include npm/BroJS grandchildren even when their parent has already exited.
  if (children.length)
    setTimeout(() => {
      for (const child of children) kill(child, 'SIGKILL')
    }, 2000)
}

/** @param {string} name @param {string} cwd @param {string[]} args */
const start = (name, cwd, args) => {
  const child = spawn('npm', args, {
    cwd,
    stdio: 'inherit',
    detached: process.platform !== 'win32',
    env: {
      ...process.env,
      NANO_REGISTRY_FILE: resolve(root, 'config/nanos.dev.json'),
      NANO_REGISTRY_URL: '',
    },
  })
  children.push(child)
  child.on('error', (error) => {
    console.error(`${name}: ${error.message}`)
    stop(1)
  })
  child.on('exit', (code, signal) => {
    if (stopping) return
    console.error(`${name} stopped (${signal || code}). Stopping all servers.`)
    stop(code || 1)
  })
}

process.on('SIGINT', () => stop(130))
process.on('SIGTERM', () => stop(143))

try {
  await access(resolve(interview, 'node_modules/.bin/vp'))
  await access(resolve(root, 'node_modules/@brojs/cli/package.json'))
  console.log(
    'Starting SkillSprint + interview: http://localhost:8099/skillsprint',
  )
  start('Interview', interview, [
    'run',
    'dev',
    '--',
    '--port',
    '5173',
    '--strictPort',
  ])
  start('SkillSprint', root, ['start'])
} catch (error) {
  console.error(
    `Could not start local apps. Run npm ci in both projects. Interview directory: ${interview}`,
  )
  console.error(error instanceof Error ? error.message : error)
  stop(1)
}
