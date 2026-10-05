import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { StyleScope } from '../shared/styles/StyleScope'
import { AppShell } from './shell/AppShell'

export default function App() {
  return (
    <StyleScope>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </StyleScope>
  )
}
