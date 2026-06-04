import type { Translations } from '../i18n'

export type Operation = 'add' | 'sub' | 'mul' | 'div'
export type Difficulty = 1 | 2

export interface Problem {
  id: string
  operation: Operation
  level: number
  a: number
  b: number
  answer: number
  display: string
}

export interface LevelConfig {
  level: number
  operation: Operation | 'mixed'
  difficulty: Difficulty | null
  icon: string
}

export type PlayableLevelConfig = LevelConfig & {
  operation: Operation
  difficulty: Difficulty
}

export const LEVELS: LevelConfig[] = [
  { level: 1, operation: 'add', difficulty: 1, icon: 'level-add' },
  { level: 2, operation: 'add', difficulty: 2, icon: 'level-add' },
  { level: 3, operation: 'sub', difficulty: 1, icon: 'level-sub' },
  { level: 4, operation: 'sub', difficulty: 2, icon: 'level-sub' },
  { level: 5, operation: 'mul', difficulty: 1, icon: 'level-mul' },
  { level: 6, operation: 'mul', difficulty: 2, icon: 'level-mul' },
  { level: 7, operation: 'div', difficulty: 1, icon: 'level-div' },
  { level: 8, operation: 'div', difficulty: 2, icon: 'level-div' },
  { level: 9, operation: 'mixed', difficulty: null, icon: 'level-mixed' },
]

export const LEVEL_COUNT = LEVELS.length

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0]
}

export function levelIconUrl(level: number): string {
  const { icon } = getLevelConfig(level)
  return `${import.meta.env.BASE_URL}icons/${icon}.png`
}

export function isMixedLevel(level: number): boolean {
  return getLevelConfig(level).operation === 'mixed'
}

export function getLevelTitle(level: number, t: Translations): string {
  const cfg = getLevelConfig(level)
  if (cfg.operation === 'mixed') return t.levels.mixed
  return t.levels[cfg.operation]
}

export function getLevelDifficultyLabel(level: number, t: Translations): string | null {
  const cfg = getLevelConfig(level)
  if (cfg.difficulty === 1) return t.levels.difficulty1
  if (cfg.difficulty === 2) return t.levels.difficulty2
  return null
}

export function getLevelLabel(level: number, t: Translations): string {
  const title = getLevelTitle(level, t)
  const diff = getLevelDifficultyLabel(level, t)
  return diff ? `${title} — ${diff}` : title
}

export const OPERATIONS: Operation[] = ['add', 'sub', 'mul', 'div']

export const PLAYABLE_LEVELS = LEVELS.filter(
  (l): l is PlayableLevelConfig => l.operation !== 'mixed' && l.difficulty != null,
)
