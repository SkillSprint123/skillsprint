import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  createNanoSession,
  resolveResourceUrl,
} from '../../packages/nano-runtime/src'
import type {
  NanoState,
  NanoSessionOptions,
} from '../../packages/nano-runtime/src'
import type { NanoRegistry } from '../../packages/contracts/src'

// A minimal DOM double checks container ownership and resource cleanup.
class ElementDouble {
  dataset: Record<string, string> = {}
  children: ElementDouble[] = []
  parent: ElementDouble | undefined
  ownerDocument = {
    createElement: () => new ElementDouble(),
    defaultView: { HTMLElement: ElementDouble },
  }
  append(child: ElementDouble) {
    child.parent = this
    this.children.push(child)
  }
  remove() {
    if (this.parent)
      this.parent.children = this.parent.children.filter(
        (child) => child !== this,
      )
    this.parent = undefined
  }
}

const registry: NanoRegistry = {
  schemaVersion: 1,
  nanos: {
    trainer: {
      version: '1.0.0',
      contractVersion: 1,
      entry: './nanos/trainer/1.0.0/index.js',
      styles: [],
    },
  },
}
const fixture = (overrides: Partial<NanoSessionOptions> = {}) => {
  const container = new ElementDouble()
  const states: NanoState[] = []
  const options: NanoSessionOptions = {
    id: 'trainer',
    container: container as unknown as HTMLElement,
    context: {
      basePath: '/skillsprint/trainer',
      apiBaseUrl: '/api',
      user: null,
      navigate: () => {},
    },
    registryUrl: 'https://example.test/static/skillsprint/1.0.0/nanos.json',
    loadRegistry: async (url) => ({ registry, url }),
    importModule: async () => ({
      contractVersion: 1,
      mount: () => ({ unmount: () => {} }),
    }),
    onState: (state) => states.push(state),
    ...overrides,
  }
  return { container, states, session: createNanoSession(options) }
}

test('a nano mounts from the registry URL and unmounts exactly once', async () => {
  let unmounts = 0
  let url = ''
  const { session, states, container } = fixture({
    importModule: async (value) => {
      url = value
      return {
        contractVersion: 1,
        mount: () => ({
          unmount: () => {
            unmounts += 1
          },
        }),
      }
    },
  })
  await Promise.all([session.start(), session.start()])
  assert.equal(
    url,
    'https://example.test/static/skillsprint/1.0.0/nanos/trainer/1.0.0/index.js',
  )
  assert.deepEqual(
    states.map((state) => state.status),
    ['loading', 'mounted'],
  )
  assert.equal(container.children.length, 1)
  await session.dispose()
  await session.dispose()
  assert.equal(container.children.length, 0)
  assert.equal(unmounts, 1)
})

test('leaving during import prevents mount from being called', async () => {
  let finish: (value: unknown) => void = () => {}
  let entered: () => void = () => {}
  const importing = new Promise<void>((resolve) => {
    entered = resolve
  })
  let mounts = 0
  const { session, states } = fixture({
    importModule: () => {
      entered()
      return new Promise((resolve) => {
        finish = resolve
      })
    },
  })
  const start = session.start()
  await importing
  await session.dispose()
  finish({
    contractVersion: 1,
    mount: () => {
      mounts += 1
    },
  })
  await start
  assert.equal(mounts, 0)
  assert.deepEqual(
    states.map((state) => state.status),
    ['loading'],
  )
})

test('a late asynchronous mount is cleaned up without affecting the new container', async () => {
  let finish: (value: unknown) => void = () => {}
  let entered: () => void = () => {}
  const mounting = new Promise<void>((resolve) => {
    entered = resolve
  })
  let unmounts = 0
  const { session, container, states } = fixture({
    importModule: async () => ({
      contractVersion: 1,
      mount: () => {
        entered()
        return new Promise((resolve) => {
          finish = resolve
        })
      },
    }),
  })
  const start = session.start()
  await mounting
  await session.dispose()
  const next = new ElementDouble()
  container.append(next)
  finish({
    unmount: () => {
      unmounts += 1
    },
  })
  await start
  assert.equal(unmounts, 1)
  assert.deepEqual(container.children, [next])
  assert.deepEqual(
    states.map((state) => state.status),
    ['loading'],
  )
})

test('unmount errors are reported, the container is removed, and cleanup is not repeated', async () => {
  const errors: unknown[] = []
  const { session, container } = fixture({
    importModule: async () => ({
      contractVersion: 1,
      mount: () => ({
        unmount: async () => {
          throw new Error('cleanup')
        },
      }),
    }),
    onCleanupError: (error) => errors.push(error),
  })
  await session.start()
  await session.dispose()
  await session.dispose()
  assert.equal(errors.length, 1)
  assert.equal(container.children.length, 0)
})

test('missing modules, invalid contracts, and network failures have distinct states', async () => {
  const missing = fixture({ id: 'progress' })
  await missing.session.start()
  assert.equal(missing.states.at(-1)?.status, 'unavailable')
  for (const overrides of [
    { importModule: async () => ({ contractVersion: 2, mount: () => {} }) },
    {
      loadRegistry: async () => {
        throw new Error('HTTP 503')
      },
    },
    { importModule: async () => ({ contractVersion: 1, mount: () => ({}) }) },
  ]) {
    const { session, states, container } = fixture(overrides)
    await session.start()
    assert.equal(states.at(-1)?.status, 'error')
    assert.equal(container.children.length, 0)
  }
})

test('error details are available to developers and omitted from the user message', async () => {
  const error = new Error(
    'https://example.test/private/module.js returned HTTP 503',
  )
  const details: unknown[] = []
  const { session, states } = fixture({
    importModule: async () => {
      throw error
    },
    onLoadError: (value) => details.push(value),
  })
  await session.start()
  assert.deepEqual(details, [error])
  assert.equal(
    states.at(-1)?.message,
    'Не удалось открыть раздел. Попробуйте ещё раз.',
  )
})

test('timeouts detach the container and late mounts are still cleaned up', async () => {
  let finish: (value: unknown) => void = () => {}
  let timedOut: () => void = () => {}
  const timeout = new Promise<void>((resolve) => {
    timedOut = resolve
  })
  let unmounts = 0
  const { session, container } = fixture({
    timeoutMs: 20,
    onState: (state) => {
      if (state.status === 'error') timedOut()
    },
    importModule: async () => ({
      contractVersion: 1,
      mount: () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    }),
  })
  const start = session.start()
  await timeout
  assert.equal(container.children.length, 0)
  finish({
    unmount: () => {
      unmounts += 1
    },
  })
  await start
  assert.equal(unmounts, 1)
})

test('resources resolve relative to the registry and non-HTTP protocols are rejected', () => {
  assert.equal(
    resolveResourceUrl('./chunk.js', 'https://example.test/a/nanos.json'),
    'https://example.test/a/chunk.js',
  )
  for (const url of [
    'javascript:alert(1)',
    'data:text/javascript,export default 1',
    'file:///tmp/a.js',
  ]) {
    assert.throws(() => resolveResourceUrl(url, 'https://example.test/'))
  }
})
