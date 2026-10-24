import React from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { useCss } from '../../shared/styles/useCss'
import { appConfig } from '../config/config'
import { AppRoutes } from '../router/AppRoutes'
import { joinRoute } from '../router/paths'
import { sections } from '../router/sections'
import { createShellStyles } from './styles'
import { sectionIcons, shellAssets } from './assets'

export const AppShell = () => {
  const styles = createShellStyles(useCss())
  const { pathname } = useLocation()
  const currentSection = sections.find(({ path }) => {
    const route = joinRoute(appConfig.basePath, path)
    return pathname === route || pathname.startsWith(`${route}/`)
  })
  const isOverview =
    pathname === appConfig.basePath ||
    pathname === `${appConfig.basePath.replace(/\/$/, '')}/`
  const caption = isOverview
    ? 'Твой рабочий стол'
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
          SkillSprint.
        </Link>
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
              Большая цель.
              <br />
              Маленькие шаги каждый день.
            </p>
          </div>
          <div className={styles.profile}>
            <span className={styles.avatar} aria-hidden="true">
              Г
            </span>
            <div>
              <p className={styles.profileName}>Гость</p>
              <p className={styles.profileDescription}>
                Твоя подготовка к цели
              </p>
            </div>
          </div>
        </div>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.topBar}>
          <p>{caption}</p>
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
        <main id="skillsprint-content" className={styles.content} tabIndex={-1}>
          <AppRoutes />
        </main>
        <footer className={styles.footer}>
          <p>В своём темпе. К своей цели.</p>
          <div className={styles.footerMeta}>
            <Link to={joinRoute(appConfig.basePath, 'pro')}>Тариф Pro</Link>
            <span>Версия {appConfig.version}</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
