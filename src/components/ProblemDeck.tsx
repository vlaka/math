import { useMemo, useState } from 'react'
import { ProblemCard } from './ProblemCard'
import { generateDeck } from '../utils/problemGenerator'
import { useNumberRecognition } from '../hooks/useNumberRecognition'
import { useProgress } from '../hooks/useProgress'
import type { Lang, Translations } from '../i18n'
import './ProblemDeck.css'

interface ProblemDeckProps {
  level: number
  mode: 'listen' | 'speak'
  lang: Lang
  t: Translations
  debug: boolean
  onBack: () => void
  onLogAnswer: (correct: boolean) => void
}

const DECK_SIZE = 20

export function ProblemDeck({ level, mode, lang, t, debug, onBack, onLogAnswer }: ProblemDeckProps) {
  const { listen, status: speechStatus, available: speechAvailable, result: speechResult, interimText, debugLog } = useNumberRecognition(lang)
  const { progress, markCorrect, markIncorrect } = useProgress()

  const deck = useMemo(() => {
    return generateDeck(level, DECK_SIZE, progress)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

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
      setCompleted(true)
    }
  }

  const restart = () => {
    setCurrentIndex(0)
    setCompleted(false)
    setScore({ correct: 0, total: 0 })
  }

  if (completed) {
    return (
      <div className="deck-done">
        <div className="deck-done__emoji">🎉</div>
        <h2 className="deck-done__title">{t.done.title}</h2>
        <p className="deck-done__subtitle">{t.done.subtitle}</p>
        <p className="deck-done__score">{score.correct} / {score.total}</p>
        <div className="deck-done__actions">
          <button className="deck-done__btn deck-done__btn--restart" onClick={restart}>
            {t.done.restart}
          </button>
          <button className="deck-done__btn deck-done__btn--back" onClick={onBack}>
            {t.done.backToLevels}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="deck">
      <div className="deck__header">
        <button className="deck__back" onClick={onBack}>←</button>
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
        key={deck[currentIndex].id}
        problem={deck[currentIndex]}
        mode={mode}
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
