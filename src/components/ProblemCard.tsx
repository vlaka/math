import { useState } from 'react'
import type { Problem } from '../data/levels'
import type { Translations } from '../i18n'
import { NumericKeypad } from './NumericKeypad'
import './ProblemCard.css'

interface ProblemCardProps {
  problem: Problem
  mode: 'listen' | 'speak'
  t: Translations
  onCorrect: () => void
  onIncorrect: () => void
  onListen: (expected: number) => Promise<boolean>
  speechStatus: 'idle' | 'listening' | 'processing'
  speechAvailable: boolean
  speechResult: string | null
  interimText: string | null
}

export function ProblemCard({
  problem,
  mode,
  t,
  onCorrect,
  onIncorrect,
  onListen,
  speechStatus,
  speechAvailable,
  speechResult,
  interimText,
}: ProblemCardProps) {
  const [revealed, setRevealed] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [keypadValue, setKeypadValue] = useState('')

  const answerDisplay = problem.display.replace('?', String(problem.answer))

  const handleReveal = () => {
    if (!revealed) setRevealed(true)
  }

  const handleCorrect = () => {
    setRevealed(false)
    setFeedback(null)
    setKeypadValue('')
    onCorrect()
  }

  const handleIncorrect = () => {
    setRevealed(false)
    setFeedback(null)
    setKeypadValue('')
    onIncorrect()
  }

  const checkAnswer = (value: string) => {
    const num = parseInt(value, 10)
    if (num === problem.answer) {
      setFeedback('correct')
      setTimeout(handleCorrect, 1200)
    } else {
      setFeedback('incorrect')
      setRevealed(true)
    }
  }

  const handleMicClick = async () => {
    if (!speechAvailable || speechStatus !== 'idle') return
    const correct = await onListen(problem.answer)
    if (correct) {
      setFeedback('correct')
      setTimeout(handleCorrect, 1200)
    } else {
      setFeedback('incorrect')
      setRevealed(true)
    }
  }

  const feedbackClass = feedback === 'correct'
    ? 'card--correct'
    : feedback === 'incorrect'
      ? 'card--tryagain'
      : ''

  return (
    <div className={`card ${feedbackClass}`}>
      <div className="card__problem-container">
        <span className="card__problem">{problem.display}</span>
        {revealed && (
          <span className="card__answer">{answerDisplay}</span>
        )}
      </div>

      {mode === 'listen' && (
        <div className="card__actions">
          {!revealed ? (
            <button className="card__btn card__btn--reveal" onClick={handleReveal}>
              👀 {t.card.showAnswer}
            </button>
          ) : (
            <>
              <button className="card__btn card__btn--know" onClick={handleCorrect}>
                {t.card.know}
              </button>
              <button className="card__btn card__btn--learning" onClick={handleIncorrect}>
                {t.card.learning}
              </button>
            </>
          )}
        </div>
      )}

      {mode === 'speak' && (
        <div className="card__actions">
          {feedback === null && (
            <>
              {speechAvailable && (
                <button
                  className={`card__btn card__btn--mic ${speechStatus === 'listening' ? 'card__btn--mic-active' : ''}`}
                  onClick={handleMicClick}
                  disabled={speechStatus !== 'idle'}
                >
                  🎤 {speechStatus === 'listening' ? t.card.listening : t.card.speak}
                </button>
              )}
              {speechStatus === 'listening' && interimText && (
                <div className="card__interim">{interimText}</div>
              )}
              <NumericKeypad
                value={keypadValue}
                onChange={setKeypadValue}
                onSubmit={() => checkAnswer(keypadValue)}
                clearLabel={t.card.clear}
                submitLabel={t.card.submit}
                disabled={speechStatus !== 'idle'}
              />
            </>
          )}

          {feedback === 'correct' && (
            <div className="card__feedback card__feedback--correct">
              ✨ {t.card.correct}
            </div>
          )}

          {feedback === 'incorrect' && (
            <>
              <div className="card__feedback card__feedback--tryagain">
                {t.card.tryMore}
                {speechResult && (
                  <span className="card__heard"> ({speechResult})</span>
                )}
              </div>
              <span className="card__answer card__answer--inline">{answerDisplay}</span>
              <div className="card__actions-row">
                <button className="card__btn card__btn--reveal" onClick={() => { setFeedback(null); setRevealed(false) }}>
                  🎤 {t.card.tryAgain}
                </button>
                <button className="card__btn card__btn--learning" onClick={handleIncorrect}>
                  {t.card.next}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
