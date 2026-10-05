import React from 'react'
import { NavLink } from 'react-router-dom'

import { useCss } from '../../shared/styles/useCss'
import { appConfig } from '../config/config'
import { AppRoutes } from '../router/AppRoutes'
import { joinRoute } from '../router/paths'
import { sections } from '../router/sections'
import { createShellStyles } from './styles'

export const AppShell = () => {
  const styles = createShellStyles(useCss())
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#skillsprint-content">
        Перейти к содержимому
      </a>
      <aside className={styles.sidebar}>
        <p className={styles.brand}>SkillSprint</p>
        <nav aria-label="Разделы SkillSprint" className={styles.navigation}>
          <NavLink to={appConfig.basePath} end className={styles.link}>
            Обзор
          </NavLink>
          {sections.map(({ path, title }) => (
            <NavLink
              key={path}
              to={joinRoute(appConfig.basePath, path)}
              className={styles.link}
            >
              {title}
            </NavLink>
          ))}
        </nav>
        <p className={styles.version}>Версия {appConfig.version}</p>
      </aside>
      <main id="skillsprint-content" className={styles.content} tabIndex={-1}>
        <AppRoutes />
      </main>
    </div>
  )
}
