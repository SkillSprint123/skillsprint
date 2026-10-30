import React, { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../app/auth/useAuth'
import { returnAfterLogin } from '../../app/auth/storage'
import type { FormSubmitEvent } from '../../app/auth/types'
import { appConfig } from '../../app/config/config'
import { joinRoute } from '../../app/router/paths'
import { shellAssets } from '../../app/shell/assets'
import { useCss } from '../../shared/styles/useCss'
import { createAuthStyles } from './styles'
import { usePageTransition } from '../../shared/motion/usePageTransition'

export const AuthPage = () => {
  const styles = createAuthStyles(useCss())
  const location = useLocation()
  const { account, signIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const entrance = usePageTransition('auth')
  const register =
    location.pathname === joinRoute(appConfig.basePath, 'register')
  const submit = (event: FormSubmitEvent) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    signIn({
      email: String(form.get('email') || ''),
      displayName: register ? String(form.get('displayName') || '') : undefined,
    })
  }
  if (account.signedIn)
    return (
      <Navigate
        replace
        to={returnAfterLogin(location.state, appConfig.basePath)}
      />
    )
  return (
    <div className={styles.page}>
      <aside className={styles.story}>
        <div className={styles.brand}>
          <span>
            <img src={shellAssets.brand} alt="" />
          </span>
          SkillSprint.
        </div>
        <div className={styles.storyCopy}>
          <p className={styles.eyebrow}>ТВОЯ КАРЬЕРА. ТВОЙ ТЕМП.</p>
          <h2>
            Следующая глава
            <br />
            начинается с тебя.
          </h2>
          <p>
            Планируй подготовку, пробуй новое и приходи на собеседование с
            уверенностью.
          </p>
          <div className={styles.steps}>
            <span>
              <b>01</b> Найди свой маршрут
            </span>
            <span>
              <b>02</b> Преврати знания в практику
            </span>
            <span>
              <b>03</b> Замечай, как растёшь
            </span>
          </div>
        </div>
        <p className={styles.storyFooter}>По одному шагу к большой цели.</p>
      </aside>
      <main className={styles.main} ref={entrance}>
        <div className={styles.formWrap}>
          <span className={styles.tag}>Твоё личное пространство</span>
          <div className={styles.heading} key={register ? 'register' : 'login'}>
            <h1>{register ? 'Давай знакомиться' : 'С возвращением'}</h1>
            <p className={styles.subtitle}>
              {register
                ? 'Всё для твоего следующего карьерного шага.'
                : 'Твоя подготовка ждёт. Продолжим?'}
            </p>
          </div>
          <div
            className={styles.tabs}
            data-mode={register ? 'register' : 'login'}
            aria-label="Вход и регистрация"
          >
            <Link
              to={joinRoute(appConfig.basePath, 'login')}
              state={location.state}
              aria-current={!register ? 'page' : undefined}
            >
              Вход
            </Link>
            <Link
              to={joinRoute(appConfig.basePath, 'register')}
              state={location.state}
              aria-current={register ? 'page' : undefined}
            >
              Регистрация
            </Link>
          </div>
          <form noValidate onSubmit={submit} className={styles.form}>
            <div
              className={styles.nameReveal}
              data-open={register}
              aria-hidden={!register}
            >
              <div>
                <label className={styles.field}>
                  Как к тебе обращаться
                  <input
                    name="displayName"
                    autoComplete="name"
                    placeholder="Твоё имя"
                    disabled={!register}
                  />
                </label>
              </div>
            </div>
            <label className={styles.field}>
              Электронная почта
              <input
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
              />
            </label>
            <label className={styles.field} htmlFor="account-password">
              Пароль
            </label>
            <div className={styles.password}>
              <input
                id="account-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={register ? 'new-password' : 'current-password'}
                placeholder="Любой пароль или оставь пустым"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? 'Скрыть' : 'Показать'}
              </button>
            </div>
            <p className={styles.hint}>Вход сохранится в этом браузере.</p>
            <button className={styles.submit} type="submit">
              {register ? 'Создать аккаунт' : 'Войти'}
              <span aria-hidden="true">→</span>
            </button>
          </form>
          <div className={styles.demoNote}>
            <span aria-hidden="true">✦</span>
            <div>
              <strong>Быстрый вход включён</strong>
              <p>
                Можно войти с любыми данными или оставить поля пустыми. Пароль
                не сохраняется.
              </p>
            </div>
          </div>
        </div>
        <footer className={styles.footer}>
          SkillSprint · В своём темпе. К своей цели.
        </footer>
      </main>
    </div>
  )
}
