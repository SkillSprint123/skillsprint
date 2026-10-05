import { tokens } from './tokens'
import type { CssStyles } from './types'

export const panelStyles = {
  padding: '24px',
  background: tokens.colors.surface,
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: '12px',
} satisfies CssStyles
