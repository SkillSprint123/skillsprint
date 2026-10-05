import type { SpawnSyncOptionsWithStringEncoding } from 'node:child_process'

export type RunCommand = (
  command: string,
  args: string[],
  cwd: string,
) => string
export type CommandOptions = SpawnSyncOptionsWithStringEncoding
