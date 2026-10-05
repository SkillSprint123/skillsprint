import React from 'react'

import { useCss } from '../../shared/styles/useCss'
import { createSectionStyles } from './styles'
import type { SectionPageProps } from './types'

export const SectionPage = ({ title, description }: SectionPageProps) => {
  const styles = createSectionStyles(useCss())
  return (
    <section className={styles.panel}>
      <h1>{title}</h1>
      <p>{description}</p>
      <p className={styles.muted}>Раздел пока недоступен.</p>
    </section>
  )
}
