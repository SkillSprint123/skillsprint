import { panelStyles } from '../../shared/styles/panel'
import { tokens } from '../../shared/styles/tokens'
import type { CssFunction } from '../../shared/styles/types'

export const createNanoStyles = (css: CssFunction) => ({
  panel: css(panelStyles),
  muted: css({ color: tokens.colors.muted }),
  button: css({
    padding: '10px 16px',
    background: tokens.colors.accent,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    font: 'inherit',
    '&:focus-visible': {
      outline: `2px solid ${tokens.colors.accent}`,
      outlineOffset: '3px',
    },
  }),
})
