import { interFonts } from './fonts'
import type { CssFunction } from './types'

export const registerFonts = (css: CssFunction) => {
  for (const { src, unicodeRange } of interFonts) {
    css({
      '@font-face': {
        fontFamily: 'SkillSprint Inter',
        src: `url("${src}") format("woff2")`,
        fontStyle: 'normal',
        fontWeight: '100 900',
        fontDisplay: 'swap',
        unicodeRange,
      },
    })
  }
}
