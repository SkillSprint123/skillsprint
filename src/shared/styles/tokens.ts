// Общие значения не зависят от React/Vue и не содержат глобальных селекторов.
export const tokens = {
  colors: {
    background: '#f5f7fb',
    surface: '#ffffff',
    text: '#18243a',
    muted: '#53627a',
    accent: '#3730a3',
    active: '#eeedff',
    border: '#dce2eb',
  },
  fontFamily: 'system-ui, sans-serif',
  mobile: '@media (max-width: 700px)',
} as const
