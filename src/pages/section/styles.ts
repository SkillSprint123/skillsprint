import { tokens } from '../../shared/styles/tokens'
import type { CssFunction } from '../../shared/styles/types'
import { panelStyles } from '../../shared/styles/panel'

export const createSectionStyles = (css: CssFunction) => ({
  panel: css(panelStyles),
  muted: css({ color: tokens.colors.muted }),
})
