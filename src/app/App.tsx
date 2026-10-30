import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { StyleScope } from '../shared/styles/StyleScope'
import { AuthProvider } from './auth/AuthProvider'
import { AuthRoutes } from './auth/AuthRoutes'

export default function App() {
  return (
    <StyleScope>
      <BrowserRouter>
        <AuthProvider>
          <AuthRoutes />
        </AuthProvider>
      </BrowserRouter>
    </StyleScope>
  )
}
