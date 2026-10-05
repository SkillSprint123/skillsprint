import { panelStyles } from '../../shared/styles/panel'
import type { CssFunction } from '../../shared/styles/types'

export const createOverviewStyles = (css: CssFunction) => ({
  cards: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginTop: '24px',
  }),
  panel: css({ ...panelStyles, '& h2': { marginTop: 0, fontSize: '20px' } }),
})
