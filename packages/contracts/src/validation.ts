import {
  nanoContextSchema,
  nanoInstanceSchema,
  nanoModuleSchema,
  nanoRegistrySchema,
} from './schemas'
import type {
  NanoContext,
  NanoInstance,
  NanoModule,
  NanoRegistry,
} from './types'

// Validate input while preserving original functions and their this binding. Keep the original module.
export function assertNanoModule(value: unknown): asserts value is NanoModule {
  if (!nanoModuleSchema.safeParse(value).success) {
    throw new Error(
      'Incompatible nanofrontend: expected contractVersion: 1 and mount',
    )
  }
}

export function assertNanoInstance(
  value: unknown,
): asserts value is NanoInstance {
  if (!nanoInstanceSchema.safeParse(value).success) {
    throw new Error('The nanofrontend must return an instance with unmount')
  }
}

export function assertNanoContext(
  value: unknown,
): asserts value is NanoContext {
  if (!nanoContextSchema.safeParse(value).success) {
    throw new Error('Invalid nanofrontend context')
  }
}

export function assertNanoRegistry(
  value: unknown,
): asserts value is NanoRegistry {
  const result = nanoRegistrySchema.safeParse(value)
  if (!result.success)
    throw new Error(`Invalid nanofrontend registry: ${result.error.message}`)
}
