import React from 'react'
import { Link } from 'react-router-dom'

import { appConfig } from '../../app/config/config'
import { joinRoute } from '../../app/router/paths'
import { sections } from '../../app/router/sections'
import { useCss } from '../../shared/styles/useCss'
import { createOverviewStyles } from './styles'

export const OverviewPage = () => {
  const styles = createOverviewStyles(useCss())
  return (
    <section>
      <h1>Подготовка к собеседованию</h1>
      <p>Поставьте цель, составьте план и практикуйтесь в удобном темпе.</p>
      <div className={styles.cards}>
        {sections.map(({ path, title, description }) => (
          <article key={path} className={styles.panel}>
            <h2>
              <Link to={joinRoute(appConfig.basePath, path)}>{title}</Link>
            </h2>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
