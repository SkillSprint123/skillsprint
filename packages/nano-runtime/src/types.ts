import type { z } from 'zod'

import type { NanoContext } from '../../contracts/src'
import type { nanoStateSchema, loadedRegistrySchema } from './schemas'

export type NanoState = z.infer<typeof nanoStateSchema>
export type LoadedRegistry = z.infer<typeof loadedRegistrySchema>
export type ModuleImporter = (url: string) => Promise<unknown>
export type RegistryLoader = (
  url: string,
  signal: AbortSignal,
) => Promise<LoadedRegistry>
export type StyleLoader = (
  url: string,
  container: HTMLElement,
  signal: AbortSignal,
) => Promise<void>
export type NanoSessionOptions = {
  id: string
  container: HTMLElement
  context: NanoContext
  registryUrl: string
  onState: (state: NanoState) => void
  onCleanupError?: (error: unknown) => void
  onLoadError?: (error: unknown) => void
  timeoutMs?: number
  importModule?: ModuleImporter
  loadRegistry?: RegistryLoader
  loadStyle?: StyleLoader
}
export type NanoSession = {
  start: () => Promise<void>
  dispose: () => Promise<void>
}
