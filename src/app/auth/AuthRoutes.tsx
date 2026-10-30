import React, { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { appConfig } from '../config/config'
import { joinRoute } from '../router/paths'
import { useAuth } from './useAuth'

const AppShell = lazy(() =>
  import(/* webpackChunkName: "app-shell" */ '../shell/AppShell').then(
    ({ AppShell }) => ({ default: AppShell }),
  ),
)
const AuthPage = lazy(() =>
  import(/* webpackChunkName: "auth-page" */ '../../pages/auth/AuthPage').then(
    ({ AuthPage }) => ({ default: AuthPage }),
  ),
)

const ProtectedApp = () => {
  const { account } = useAuth()
  const { pathname, search, hash } = useLocation()
  if (!account.signedIn)
    return (
      <Navigate
        replace
        to={joinRoute(appConfig.basePath, 'login')}
        state={{ from: `${pathname}${search}${hash}` }}
      />
    )
  return <AppShell />
}

export const AuthRoutes = () => (
  <Suspense fallback={<p role="status">Загрузка SkillSprint…</p>}>
    <Routes>
      <Route
        path={joinRoute(appConfig.basePath, 'login')}
        element={<AuthPage />}
      />
      <Route
        path={joinRoute(appConfig.basePath, 'register')}
        element={<AuthPage />}
      />
      <Route path="*" element={<ProtectedApp />} />
    </Routes>
  </Suspense>
)
