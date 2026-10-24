// Общие значения не зависят от React/Vue и не содержат глобальных селекторов.
export const tokens = {
  colors: {
    background: '#f5f7fb',
    surface: '#ffffff',
    text: '#263b52',
    muted: '#788597',
    accent: '#2e70b2',
    active: '#eaf2fb',
    border: '#e6ebf1',
    warm: '#fff2df',
    orange: '#ab6931',
  },
  fontFamily: '"SkillSprint Inter", system-ui, sans-serif',
  mobile: '@media (max-width: 700px)',
} as const
