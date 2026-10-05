import { tokens } from '../../shared/styles/tokens'
import type { CssFunction } from '../../shared/styles/types'

export const createShellStyles = (css: CssFunction) => ({
  shell: css({
    display: 'flex',
    minHeight: '100vh',
    background: tokens.colors.background,
    color: tokens.colors.text,
    fontFamily: tokens.fontFamily,
    lineHeight: 1.6,
    '& a': { color: tokens.colors.accent },
    '& a:focus-visible': {
      outline: `3px solid ${tokens.colors.accent}`,
      outlineOffset: '4px',
    },
    [tokens.mobile]: { flexDirection: 'column' },
  }),
  sidebar: css({
    width: '230px',
    flexShrink: 0,
    padding: '24px',
    background: tokens.colors.surface,
    borderRight: `1px solid ${tokens.colors.border}`,
    [tokens.mobile]: {
      width: 'auto',
      padding: '16px',
      borderRight: 0,
      borderBottom: `1px solid ${tokens.colors.border}`,
    },
  }),
  brand: css({ fontSize: '24px', fontWeight: 700 }),
  navigation: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    [tokens.mobile]: { flexDirection: 'row', flexWrap: 'wrap' },
  }),
  link: css({
    padding: '10px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    '&[aria-current="page"]': {
      background: tokens.colors.active,
      fontWeight: 700,
    },
  }),
  version: css({ color: tokens.colors.muted }),
  content: css({
    flex: 1,
    minWidth: 0,
    maxWidth: '1100px',
    padding: '32px',
    [tokens.mobile]: { padding: '20px' },
  }),
  skipLink: css({
    position: 'absolute',
    left: '16px',
    top: '-100px',
    padding: '12px',
    background: tokens.colors.surface,
    zIndex: 1,
    '&:focus': { top: '16px' },
  }),
})
