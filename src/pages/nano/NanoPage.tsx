import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  createNanoSession,
  resolveResourceUrl,
} from '../../../packages/nano-runtime/src'
import type { NanoState } from '../../../packages/nano-runtime/src'
import { appConfig } from '../../app/config/config'
import { useCss } from '../../shared/styles/useCss'
import { createNanoStyles } from './styles'
import type { NanoPageProps } from './types'
import { useAuth } from '../../app/auth/useAuth'

export const NanoPage = ({
  nanoId,
  basePath,
  title,
  description,
}: NanoPageProps) => {
  const styles = createNanoStyles(useCss())
  const {
    account: { profile },
  } = useAuth()
  const target = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<NanoState>({ status: 'loading' })

  useEffect(() => {
    if (!target.current) return
    let session
    try {
      session = createNanoSession({
        id: nanoId,
        container: target.current,
        registryUrl: resolveResourceUrl(
          appConfig.registryUrl || 'nanos.json',
          resolveResourceUrl(__webpack_public_path__, window.location.href),
        ),
        context: {
          basePath,
          apiBaseUrl: appConfig.apiBaseUrl,
          user: { id: profile.id, displayName: profile.displayName },
          navigate: (path) => navigateRef.current(path),
        },
        onState: setState,
        onCleanupError: (error) =>
          console.error(`SkillSprint: ошибка отключения ${nanoId}`, error),
        onLoadError: (error) =>
          console.error(`SkillSprint: ошибка загрузки ${nanoId}`, error),
      })
    } catch (error) {
      console.error(`SkillSprint: неверная конфигурация ${nanoId}`, error)
      setState({
        status: 'error',
        message: 'Не удалось открыть раздел. Попробуйте ещё раз.',
      })
      return
    }
    void session.start()
    return () => {
      void session.dispose()
    }
  }, [nanoId, basePath, attempt, profile.id, profile.displayName])

  return (
    <section>
      {!(nanoId === 'interview' && state.status === 'mounted') && (
        <>
          <h1>{title}</h1>
          <p className={styles.muted}>{description}</p>
        </>
      )}
      {state.status !== 'mounted' && (
        <div
          className={styles.panel}
          role={state.status === 'error' ? 'alert' : 'status'}
        >
          <p>
            {state.status === 'loading' ? 'Загружаем раздел…' : state.message}
          </p>
          {state.status === 'error' && (
            <button
              className={styles.button}
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
            >
              Попробовать ещё раз
            </button>
          )}
        </div>
      )}
      <div ref={target} aria-busy={state.status === 'loading'} />
    </section>
  )
}
