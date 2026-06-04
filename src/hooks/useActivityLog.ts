import { useCallback, useState } from 'react'

interface DayStats {
  listenSessions: number
  speakSessions: number
  correctAnswers: number
  totalAnswers: number
}

type ActivityMap = Record<string, DayStats>

const STORAGE_KEY = 'math-activity'

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadActivity(): ActivityMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveActivity(data: ActivityMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function emptyDay(): DayStats {
  return { listenSessions: 0, speakSessions: 0, correctAnswers: 0, totalAnswers: 0 }
}

function isInMonth(key: string, now: Date): boolean {
  return key.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
}

function isInYear(key: string, now: Date): boolean {
  return key.startsWith(`${now.getFullYear()}-`)
}

export interface PeriodStats {
  listenSessions: number
  speakSessions: number
  correctAnswers: number
  totalAnswers: number
}

function aggregate(activity: ActivityMap, filter: (key: string) => boolean): PeriodStats {
  const result: PeriodStats = { listenSessions: 0, speakSessions: 0, correctAnswers: 0, totalAnswers: 0 }
  for (const [key, day] of Object.entries(activity)) {
    if (filter(key)) {
      result.listenSessions += day.listenSessions
      result.speakSessions += day.speakSessions
      result.correctAnswers += day.correctAnswers
      result.totalAnswers += day.totalAnswers
    }
  }
  return result
}

export function useActivityLog() {
  const [activity, setActivity] = useState<ActivityMap>(loadActivity)

  const logSession = useCallback((mode: 'listen' | 'speak') => {
    setActivity(prev => {
      const key = todayKey()
      const day = prev[key] || emptyDay()
      const next = {
        ...prev,
        [key]: {
          ...day,
          listenSessions: day.listenSessions + (mode === 'listen' ? 1 : 0),
          speakSessions: day.speakSessions + (mode === 'speak' ? 1 : 0),
        },
      }
      saveActivity(next)
      return next
    })
  }, [])

  const logAnswer = useCallback((correct: boolean) => {
    setActivity(prev => {
      const key = todayKey()
      const day = prev[key] || emptyDay()
      const next = {
        ...prev,
        [key]: {
          ...day,
          correctAnswers: day.correctAnswers + (correct ? 1 : 0),
          totalAnswers: day.totalAnswers + 1,
        },
      }
      saveActivity(next)
      return next
    })
  }, [])

  const now = new Date()
  const key = todayKey()
  const today = aggregate(activity, k => k === key)
  const month = aggregate(activity, k => isInMonth(k, now))
  const year = aggregate(activity, k => isInYear(k, now))

  return { logSession, logAnswer, today, month, year }
}
