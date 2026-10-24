import {
    assertNanoContext,
    assertNanoInstance,
    assertNanoModule,
    assertNanoRegistry,
} from '../../contracts/src'
import type {NanoInstance} from '../../contracts/src'

import {loadRegistry, loadStyle, resolveResourceUrl} from './resources'
import type {NanoSession, NanoSessionOptions} from './types'

// Webpack preserves native import: nanos are not bundled into the root.
const importModule = (url: string): Promise<unknown> =>
    import(/* webpackIgnore: true */ url)

export const createNanoSession = (options: NanoSessionOptions): NanoSession => {
    assertNanoContext(options.context)
    const host = options.container.ownerDocument.createElement('div')
    host.dataset.nano = options.id
    const controller = new AbortController()
    let active = true
    let instance: NanoInstance | undefined
    let started: Promise<void> | undefined
    let cleanup: Promise<void> = Promise.resolve()

    const cleanInstance = (current: NanoInstance) => {
        try {
            return Promise.resolve(current.unmount()).catch((error: unknown) => {
                options.onCleanupError?.(error)
            })
        } catch (error) {
            options.onCleanupError?.(error)
            return Promise.resolve()
        }
    }

    const dispose = () => {
        active = false
        controller.abort()
        // A separate host prevents an outdated mount from modifying a new nano container.
        host.remove()
        if (instance) {
            const current = instance
            instance = undefined
            cleanup = cleanInstance(current)
        }
        return cleanup
    }

    const run = async () => {
        if (!active) return
        options.container.append(host)
        options.onState({status: 'loading'})
        const timer = setTimeout(() => {
            if (!active) return
            options.onState({
                status: 'error',
                message: 'Модуль не ответил вовремя. Попробуйте ещё раз.',
            })
            void dispose()
        }, options.timeoutMs ?? 15000)
        try {
            const loaded = await (options.loadRegistry ?? loadRegistry)(
                options.registryUrl,
                controller.signal,
            )
            if (!active) return
            assertNanoRegistry(loaded.registry)
            const entry = loaded.registry.nanos[options.id]
            if (!entry) {
                options.onState({
                    status: 'unavailable',
                    message: 'Этот раздел пока не подключён.',
                })
                host.remove()
                return
            }
            await Promise.all(
                entry.styles.map((path) =>
                    (options.loadStyle ?? loadStyle)(
                        resolveResourceUrl(path, loaded.url),
                        host,
                        controller.signal,
                    ),
                ),
            )
            if (!active) return
            const module = await (options.importModule ?? importModule)(
                resolveResourceUrl(entry.entry, loaded.url),
            )
            if (!active) return
            assertNanoModule(module)
            if (module.contractVersion !== entry.contractVersion)
                throw new Error('Contract versions do not match')
            const mounted = await module.mount(host, options.context)
            assertNanoInstance(mounted)
            if (!active) {
                await cleanInstance(mounted)
                host.remove()
                return
            }
            instance = mounted
            options.onState({status: 'mounted'})
        } catch (error) {
            if (active) {
                options.onLoadError?.(error)
                options.onState({
                    status: 'error',
                    message: 'Не удалось открыть раздел. Попробуйте ещё раз.',
                })
                await dispose()
            }
        } finally {
            clearTimeout(timer)
        }
    }

    return {start: () => (started ??= run()), dispose}
}
