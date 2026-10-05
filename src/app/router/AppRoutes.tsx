import React from 'react'
import { Route, Routes } from 'react-router-dom'

import { OverviewPage } from '../../pages/overview/OverviewPage'
import { SectionPage } from '../../pages/section/SectionPage'
import { NotFoundPage } from '../../pages/not-found/NotFoundPage'
import { NanoPage } from '../../pages/nano/NanoPage'
import { appConfig } from '../config/config'
import { joinRoute } from './paths'
import { sections } from './sections'

export const AppRoutes = () => (
  <Routes>
    <Route path={appConfig.basePath} element={<OverviewPage />} />
    {sections.map(({ path, nanoId, title, description }) => {
      const basePath = joinRoute(appConfig.basePath, path)
      const disabled = path === 'interview' && !appConfig.features.aiInterview
      return (
        <Route
          key={path}
          path={nanoId ? `${basePath}/*` : basePath}
          element={
            nanoId && !disabled ? (
              <NanoPage
                key={nanoId}
                nanoId={nanoId}
                basePath={basePath}
                title={title}
                description={description}
              />
            ) : (
              <SectionPage
                title={title}
                description={
                  disabled
                    ? 'AI-собеседование отключено конфигурацией.'
                    : description
                }
              />
            )
          }
        />
      )
    })}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)
