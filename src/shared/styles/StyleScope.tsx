import React, { useLayoutEffect, useRef, useState } from 'react'
import { css } from 'goober'

import { CssContext } from './context'
import type { CssFunction, StyleScopeProps } from './types'

export const StyleScope = ({ children }: StyleScopeProps) => {
  const targetRef = useRef<HTMLDivElement>(null)
  const [scopedCss, setScopedCss] = useState<CssFunction | null>(null)

  useLayoutEffect(() => {
    const target = targetRef.current
    if (!target) return
    // Style-тег принадлежит контейнеру этого подключения, а не общему head.
    setScopedCss(() => css.bind({ target }))
    return () => {
      target.replaceChildren()
    }
  }, [])

  return (
    <>
      <div ref={targetRef} hidden aria-hidden="true" data-skillsprint-styles />
      {scopedCss && (
        <CssContext.Provider value={scopedCss}>{children}</CssContext.Provider>
      )}
    </>
  )
}
