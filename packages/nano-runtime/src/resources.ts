import { assertNanoRegistry } from '../../contracts/src'
import type { RegistryLoader, StyleLoader } from './types'

export const resolveResourceUrl = (path: string, base: string): string => {
  const url = new URL(path, base)
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Модуль должен загружаться по HTTP или HTTPS')
  }
  return url.href
}

export const loadRegistry: RegistryLoader = async (url, signal) => {
  const response = await fetch(url, { signal, cache: 'no-cache' })
  if (!response.ok)
    throw new Error(`Не удалось получить реестр (${response.status})`)
  const registry: unknown = await response.json()
  assertNanoRegistry(registry)
  return { registry, url: response.url || url }
}

export const loadStyle: StyleLoader = (url, container, signal) =>
  new Promise((resolve, reject) => {
    const link = container.ownerDocument.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    const finish = (error?: Error) => {
      signal.removeEventListener('abort', abort)
      link.onload = null
      link.onerror = null
      if (error) {
        link.remove()
        reject(error)
      } else resolve()
    }
    const abort = () => finish(new Error('Загрузка стилей отменена'))
    link.onload = () => finish()
    link.onerror = () => finish(new Error('Не удалось загрузить стили модуля'))
    if (signal.aborted) {
      abort()
      return
    }
    signal.addEventListener('abort', abort, { once: true })
    container.append(link)
  })
