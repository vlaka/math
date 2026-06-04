import { useMemo, useState } from 'react'
import { ProblemCard } from './ProblemCard'
import { generateDeck } from '../utils/problemGenerator'
import { shuffleArray } from '../utils/spaced-repetition'
import { useNumberRecognition } from '../hooks/useNumberRecognition'
import { useProgress } from '../hooks/useProgress'
import type { QuestConfig } from './QuestSetup'
import type { Lang, Translations } from '../i18n'
import './ProblemDeck.css'

interface QuestDeckProps {
  config: QuestConfig
  lang: Lang
  t: Translations
  debug: boolean
  onBack: () => void
  onLogAnswer: (correct: boolean) => void
}

export function QuestDeck({ config, lang, t, debug, onBack, onLogAnswer }: QuestDeckProps) {
  const { listen, status: speechStatus, available: speechAvailable, result: speechResult, interimText, debugLog } = useNumberRecognition(lang)
  const { markCorrect, markIncorrect } = useProgress()
  const [startTime] = useState(() => Date.now())

  const deck = useMemo(() => {
    const generated = generateDeck(config.level, config.problemCount)
    return shuffleArray(generated)
  }, [config.level, config.problemCount])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [elapsedMs, setElapsedMs] = useState(0)

  const handleCorrect = () => {
    markCorrect(deck[currentIndex].id)
    onLogAnswer(true)
    setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }))
    advance()
  }

  const handleIncorrect = () => {
    markIncorrect(deck[currentIndex].id)
    onLogAnswer(false)
    setScore(s => ({ ...s, total: s.total + 1 }))
    advance()
  }

  const advance = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setElapsedMs(Date.now() - startTime)
      setCompleted(true)
    }
  }

  if (completed) {
    const totalSec = Math.floor(elapsedMs / 1000)
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    const pct = deck.length > 0 ? Math.round((score.correct / deck.length) * 100) : 0

    return (
      <div className="quest-result">
        <div className="quest-result__stars">
          {pct >= 90 ? '🌟🌟🌟' : pct >= 70 ? '🌟🌟' : pct >= 50 ? '🌟' : '💪'}
        </div>
        <h1 className="quest-result__title">{t.quest.completed}</h1>
        <div className="quest-result__name">{config.name}</div>
        <div className="quest-result__stats">
          <div className="quest-result__stat">
            <span className="quest-result__stat-value">{score.correct} / {deck.length}</span>
            <span className="quest-result__stat-label">{t.quest.score}</span>
          </div>
          <div className="quest-result__stat">
            <span className="quest-result__stat-value">
              {mins > 0 ? `${mins} ${t.quest.minutes} ` : ''}{secs} {t.quest.seconds}
            </span>
            <span className="quest-result__stat-label">{t.quest.time}</span>
          </div>
        </div>
        <div className="quest-result__bar">
          <div className="quest-result__bar-fill" style={{ width: `${pct}%` }} />
          <span className="quest-result__bar-text">{pct}%</span>
        </div>
        <button className="quest-result__btn" onClick={onBack}>
          {t.quest.backHome}
        </button>
      </div>
    )
  }

  return (
    <div className="deck">
      <div className="deck__header">
        <button className="deck__back" onClick={onBack}>←</button>
        <div className="deck__quest-name">{config.name}</div>
        <div className="deck__progress">
          <div className="deck__progress-bar">
            <div
              className="deck__progress-fill"
              style={{ width: `${(currentIndex / deck.length) * 100}%` }}
            />
          </div>
          <span className="deck__progress-text">{currentIndex + 1} / {deck.length}</span>
        </div>
      </div>

      {debug && debugLog.length > 0 && (
        <div className="deck__debug">
          {debugLog.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}

      <ProblemCard
        key={`${deck[currentIndex].id}-${currentIndex}`}
        problem={deck[currentIndex]}
        mode={config.mode}
        t={t}
        onCorrect={handleCorrect}
        onIncorrect={handleIncorrect}
        onListen={listen}
        speechStatus={speechStatus}
        speechAvailable={speechAvailable}
        speechResult={speechResult}
        interimText={interimText}
      />
    </div>
  )
}
