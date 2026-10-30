import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { appConfig } from '../config/config'
import { joinRoute } from '../router/paths'
import { AppShell } from '../shell/AppShell'
import { AuthPage } from '../../pages/auth/AuthPage'
import { useAuth } from './useAuth'

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
)
