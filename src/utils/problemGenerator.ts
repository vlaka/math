import type { Difficulty, Operation, Problem } from '../data/levels'
import {
  OPERATIONS,
  PLAYABLE_LEVELS,
  getLevelConfig,
  isMixedLevel,
} from '../data/levels'
import { shuffleArray } from './spaced-repetition'

interface ProblemProgress {
  correct: number
  incorrect: number
  lastSeen: number
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeProblem(level: number, a: number, b: number, op: Operation): Problem {
  let answer: number
  let display: string

  switch (op) {
    case 'add':
      answer = a + b
      display = `${a} + ${b} = ?`
      break
    case 'sub':
      answer = a - b
      display = `${a} − ${b} = ?`
      break
    case 'mul':
      answer = a * b
      display = `${a} × ${b} = ?`
      break
    case 'div':
      answer = a / b
      display = `${a} ÷ ${b} = ?`
      break
  }

  return { id: `${op}-${a}-${b}`, operation: op, level, a, b, answer, display }
}

function generateAddition(level: number, difficulty: Difficulty): Problem {
  if (difficulty === 1) {
    let a = randInt(2, 20)
    let b = randInt(2, 20)
    while (a + b > 40) {
      a = randInt(2, 20)
      b = randInt(2, 20)
    }
    return makeProblem(level, a, b, 'add')
  }

  let a = randInt(10, 999)
  let b = randInt(10, 999)
  while (a + b > 1000) {
    a = randInt(10, 999)
    b = randInt(10, 999)
  }
  return makeProblem(level, a, b, 'add')
}

function generateSubtraction(level: number, difficulty: Difficulty): Problem {
  if (difficulty === 1) {
    const a = randInt(2, 20)
    const b = randInt(2, a)
    return makeProblem(level, a, b, 'sub')
  }

  const a = randInt(10, 999)
  const b = randInt(10, a)
  return makeProblem(level, a, b, 'sub')
}

function generateMultiplication(level: number, difficulty: Difficulty): Problem {
  if (difficulty === 1) {
    const a = randInt(2, 10)
    const b = randInt(2, 10)
    return makeProblem(level, a, b, 'mul')
  }

  const b = randInt(2, 9)
  let a = randInt(10, 99)
  while (a * b > 1000) {
    a = randInt(10, 99)
  }
  return makeProblem(level, a, b, 'mul')
}

function generateDivision(level: number, difficulty: Difficulty): Problem {
  const b = randInt(2, 10)
  if (difficulty === 1) {
    const quotient = randInt(1, 10)
    return makeProblem(level, b * quotient, b, 'div')
  }

  const quotient = randInt(1, 100)
  return makeProblem(level, b * quotient, b, 'div')
}

function generateByOperation(op: Operation, level: number, difficulty: Difficulty): Problem {
  switch (op) {
    case 'add': return generateAddition(level, difficulty)
    case 'sub': return generateSubtraction(level, difficulty)
    case 'mul': return generateMultiplication(level, difficulty)
    case 'div': return generateDivision(level, difficulty)
  }
}

export function generateProblem(level: number): Problem {
  const cfg = getLevelConfig(level)

  if (cfg.operation === 'mixed') {
    const pick = PLAYABLE_LEVELS[randInt(0, PLAYABLE_LEVELS.length - 1)]
    return generateByOperation(pick.operation, level, pick.difficulty)
  }

  return generateByOperation(cfg.operation as Operation, level, cfg.difficulty!)
}

function parseProblemId(id: string): Problem | null {
  const parts = id.split('-')
  if (parts.length !== 3) return null
  const op = parts[0] as Operation
  if (!OPERATIONS.includes(op)) return null
  const a = Number(parts[1])
  const b = Number(parts[2])
  if (Number.isNaN(a) || Number.isNaN(b)) return null
  return makeProblem(0, a, b, op)
}

function matchesLevelConfig(problem: Problem, cfg: ReturnType<typeof getLevelConfig>): boolean {
  if (cfg.operation === 'mixed') return true
  if (problem.operation !== cfg.operation) return false

  const { a, b, answer, operation } = problem

  switch (operation) {
    case 'add':
      return cfg.difficulty === 1 ? a <= 20 && b <= 20 && answer <= 40 : a >= 10 && b >= 10
    case 'sub':
      return cfg.difficulty === 1 ? a <= 20 && b <= 20 : a >= 10
    case 'mul':
      return cfg.difficulty === 1 ? a <= 10 && b <= 10 : a >= 10 || b >= 10
    case 'div':
      return cfg.difficulty === 1 ? answer <= 10 : answer > 10
  }
}

export function generateDeck(
  level: number,
  count: number,
  progress: Record<string, ProblemProgress> = {},
): Problem[] {
  const cfg = getLevelConfig(level)
  const deck: Problem[] = []
  const used = new Set<string>()

  const strugglingProblems = Object.entries(progress)
    .filter(([, p]) => p.incorrect > p.correct)
    .map(([id]) => parseProblemId(id))
    .filter((p): p is Problem => p != null)
    .filter(p => isMixedLevel(level) || p.operation === cfg.operation)
    .filter(p => isMixedLevel(level) || matchesLevelConfig(p, cfg))
    .sort((a, b) => {
      const pa = progress[a.id]
      const pb = progress[b.id]
      return (pb?.incorrect ?? 0) - (pa?.incorrect ?? 0)
    })
    .slice(0, Math.ceil(count / 2))
    .map(p => ({ ...p, level }))

  for (const p of strugglingProblems) {
    if (deck.length >= count) break
    if (!used.has(p.id)) {
      used.add(p.id)
      deck.push(p)
    }
  }

  while (deck.length < count) {
    const p = generateProblem(level)
    if (!used.has(p.id)) {
      used.add(p.id)
      deck.push(p)
    }
  }

  return shuffleArray(deck)
}
