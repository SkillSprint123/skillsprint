import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { projectRoot, run } from './release/common.mjs'

const output = resolve(projectRoot, '.artifacts')
await mkdir(output, { recursive: true })
run(
  'npm',
  [
    'pack',
    './packages/contracts',
    '--pack-destination',
    output,
    '--cache',
    resolve(projectRoot, '.nano-work/npm-cache'),
  ],
  projectRoot,
)
