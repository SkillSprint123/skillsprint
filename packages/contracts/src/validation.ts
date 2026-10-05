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

// Проверяем вход, сохраняя исходные функции и их this. Результат Zod не подменяет модуль.
export function assertNanoModule(value: unknown): asserts value is NanoModule {
  if (!nanoModuleSchema.safeParse(value).success) {
    throw new Error(
      'Несовместимый нанофронтенд: ожидаются contractVersion: 1 и mount',
    )
  }
}

export function assertNanoInstance(
  value: unknown,
): asserts value is NanoInstance {
  if (!nanoInstanceSchema.safeParse(value).success) {
    throw new Error('Нанофронтенд должен вернуть экземпляр с unmount')
  }
}

export function assertNanoContext(
  value: unknown,
): asserts value is NanoContext {
  if (!nanoContextSchema.safeParse(value).success) {
    throw new Error('Некорректный контекст нанофронтенда')
  }
}

export function assertNanoRegistry(
  value: unknown,
): asserts value is NanoRegistry {
  const result = nanoRegistrySchema.safeParse(value)
  if (!result.success)
    throw new Error(
      `Некорректный реестр нанофронтендов: ${result.error.message}`,
    )
}
