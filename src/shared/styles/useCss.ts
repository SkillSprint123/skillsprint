import { useContext } from 'react'

import { CssContext } from './context'
import type { CssFunction } from './types'

export const useCss = (): CssFunction => {
  const css = useContext(CssContext)
  if (!css)
    throw new Error('CSS-in-JS требует StyleScope внутри контейнера модуля')
  return css
}
