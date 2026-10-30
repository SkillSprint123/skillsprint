import React, { useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { useCss } from '../../shared/styles/useCss'
import { appConfig } from '../config/config'
import { AppRoutes } from '../router/AppRoutes'
import { joinRoute } from '../router/paths'
import { sections } from '../router/sections'
import { createShellStyles } from './styles'
import { sectionIcons, shellAssets } from './assets'
import { useAuth } from '../auth/useAuth'
import { initials } from '../auth/storage'
import { usePageTransition } from '../../shared/motion/usePageTransition'

export const AppShell = () => {
  const styles = createShellStyles(useCss())
  const { pathname, hash } = useLocation()
  const pageTransition = usePageTransition(pathname)
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  const { account, storageError } = useAuth()
  const currentSection = sections.find(({ path }) => {
    const route = joinRoute(appConfig.basePath, path)
    return pathname === route || pathname.startsWith(`${route}/`)
  })
  const isOverview =
    pathname === appConfig.basePath ||
    pathname === `${appConfig.basePath.replace(/\/$/, '')}/`
  const caption = isOverview
    ? 'Обзор'
    : pathname === joinRoute(appConfig.basePath, 'account')
      ? 'Мой аккаунт'
      : currentSection?.caption || currentSection?.title || 'SkillSprint'
  const today = new Date()
  const date = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(today)
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#skillsprint-content">
        Перейти к содержимому
      </a>
      <aside className={styles.sidebar}>
        <Link
          to={appConfig.basePath}
          className={styles.brand}
          aria-label="SkillSprint — обзор"
        >
          <span className={styles.brandMark}>
            <img src={shellAssets.brand} alt="" />
          </span>
          <span>
            SkillSprint<span className={styles.brandDot}>.</span>
          </span>
        </Link>
        <p className={styles.navLabel}>ТВОЁ ПРОСТРАНСТВО</p>
        <nav aria-label="Разделы SkillSprint" className={styles.navigation}>
          <NavLink to={appConfig.basePath} end className={styles.link}>
            <span className={styles.iconSlot} aria-hidden="true">
              <span className={styles.icon(shellAssets.overview)} />
            </span>
            Обзор
          </NavLink>
          {sections.map(({ path, title, navigationTitle }) =>
            path === 'pro' ? null : (
              <NavLink
                key={path}
                to={joinRoute(appConfig.basePath, path)}
                className={styles.link}
              >
                <span className={styles.iconSlot} aria-hidden="true">
                  <span className={styles.icon(sectionIcons[path])} />
                </span>
                {navigationTitle || title}
              </NavLink>
            ),
          )}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.reminder}>
            <span className={styles.iconSlot} aria-hidden="true">
              <img src={shellAssets.reminder} alt="" />
            </span>
            <p>
              По одному шагу
              <br />к большой цели.
            </p>
            <span className={styles.reminderCaption}>
              Всё получится. Просто начни.
            </span>
          </div>
          <NavLink
            to={joinRoute(appConfig.basePath, 'account')}
            className={styles.profile}
            aria-label="Открыть аккаунт"
          >
            <span
              className={styles.avatar}
              data-avatar={account.profile.avatar}
              aria-hidden="true"
            >
              {initials(account.profile.displayName)}
            </span>
            <div>
              <p className={styles.profileName}>
                {account.profile.displayName}
              </p>
              <p className={styles.profileDescription}>Мой аккаунт</p>
            </div>
            <span className={styles.profileArrow} aria-hidden="true">
              ›
            </span>
          </NavLink>
        </div>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.topBar}>
          <p className={styles.breadcrumb}>
            <span>Моё пространство</span>
            <span aria-hidden="true">/</span>
            {caption}
          </p>
          <div className={styles.topBarMeta}>
            <time
              dateTime={`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`}
              className={styles.date}
            >
              {date.charAt(0).toUpperCase() + date.slice(1)}
            </time>
            <span className={styles.streak}>
              <span className={styles.streakIcon} aria-hidden="true">
                <img src={shellAssets.streak} alt="" />
              </span>
              Начни сегодня
            </span>
          </div>
        </header>
        <main
          ref={pageTransition}
          id="skillsprint-content"
          className={styles.content}
          tabIndex={-1}
        >
          {storageError &&
            pathname !== joinRoute(appConfig.basePath, 'account') && (
              <p className={styles.storageNotice} role="status">
                Не удалось сохранить данные в браузере. Вход действует только в
                текущей вкладке.
              </p>
            )}
          <AppRoutes />
        </main>
        <footer className={styles.footer}>
          <p>В своём темпе. К своей цели.</p>
          <div className={styles.footerMeta}>
            <Link to={joinRoute(appConfig.basePath, 'pro')}>Тарифы</Link>
            <span>Версия {appConfig.version}</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
