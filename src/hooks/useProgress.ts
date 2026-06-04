import { useCallback, useState } from 'react'

interface ProblemProgress {
  correct: number
  incorrect: number
  lastSeen: number
}

type ProgressMap = Record<string, ProblemProgress>

const STORAGE_KEY = 'math-progress'

function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveProgress(data: ProgressMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>(loadProgress)

  const markCorrect = useCallback((problemId: string) => {
    setProgress(prev => {
      const entry = prev[problemId] || { correct: 0, incorrect: 0, lastSeen: 0 }
      const next = {
        ...prev,
        [problemId]: {
          correct: entry.correct + 1,
          incorrect: entry.incorrect,
          lastSeen: Date.now(),
        },
      }
      saveProgress(next)
      return next
    })
  }, [])

  const markIncorrect = useCallback((problemId: string) => {
    setProgress(prev => {
      const entry = prev[problemId] || { correct: 0, incorrect: 0, lastSeen: 0 }
      const next = {
        ...prev,
        [problemId]: {
          correct: entry.correct,
          incorrect: entry.incorrect + 1,
          lastSeen: Date.now(),
        },
      }
      saveProgress(next)
      return next
    })
  }, [])

  const isLearned = useCallback(
    (problemId: string): boolean => {
      const p = progress[problemId]
      return p != null && p.correct >= 3 && p.correct > p.incorrect
    },
    [progress],
  )

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setProgress({})
  }, [])

  return { progress, markCorrect, markIncorrect, isLearned, resetProgress }
}
