// Общие значения не зависят от React/Vue и не содержат глобальных селекторов.
export const tokens = {
  colors: {
    background: '#f6f8fb',
    surface: '#ffffff',
    text: '#263b52',
    muted: '#64748b',
    accent: '#2e70b2',
    active: '#eaf2fb',
    border: '#e1e9f2',
    warm: '#fff3e5',
    orange: '#9e602e',
  },
  fontFamily: '"SkillSprint Inter", system-ui, sans-serif',
  mobile: '@media (max-width: 700px)',
} as const
