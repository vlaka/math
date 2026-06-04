import { LEVEL_COUNT, getLevelLabel } from '../data/levels'
import type { Translations } from '../i18n'

export function levelOptions(t: Translations) {
  return Array.from({ length: LEVEL_COUNT }, (_, i) => i + 1).map(level => ({
    level,
    label: getLevelLabel(level, t),
  }))
}
