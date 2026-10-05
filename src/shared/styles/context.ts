import { createContext } from 'react'

import type { CssFunction } from './types'

export const CssContext = createContext<CssFunction | null>(null)
