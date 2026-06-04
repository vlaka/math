import { useMemo } from 'react'
import { useProgress } from '../hooks/useProgress'
import type { PeriodStats } from '../hooks/useActivityLog'
import type { Translations } from '../i18n'
import './Stats.css'

interface StatsProps {
  t: Translations
  onBack: () => void
  today: PeriodStats
  month: PeriodStats
  year: PeriodStats
}

export function Stats({ t, onBack, today, month, year }: StatsProps) {
  const { progress, isLearned } = useProgress()

  const summary = useMemo(() => {
    const entries = Object.entries(progress)
    const totalAnswered = entries.reduce((s, [, p]) => s + p.correct + p.incorrect, 0)
    const totalCorrect = entries.reduce((s, [, p]) => s + p.correct, 0)
    const learned = entries.filter(([id]) => isLearned(id)).length
    const inProgress = entries.filter(([id, p]) => {
      return (p.correct > 0 || p.incorrect > 0) && !isLearned(id)
    }).length
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
    return { totalAnswered, learned, inProgress, accuracy }
  }, [progress, isLearned])

  const problemList = useMemo(() => {
    return Object.entries(progress)
      .filter(([, p]) => p.incorrect > p.correct && p.incorrect >= 2)
      .sort((a, b) => b[1].incorrect - a[1].incorrect)
      .slice(0, 10)
      .map(([id]) => id.replace(/^(add|sub|mul|div)-/, '').replace('-', ' '))
  }, [progress])

  const periods = [
    { label: t.stats.today, data: today },
    { label: t.stats.thisMonth, data: month },
    { label: t.stats.thisYear, data: year },
  ]

  return (
    <div className="stats">
      <div className="stats__header">
        <button className="stats__back" onClick={onBack}>←</button>
        <h2 className="stats__title">{t.stats.title}</h2>
      </div>

      <div className="stats__summary">
        <div className="stats__stat">
          <span className="stats__stat-value">{summary.totalAnswered}</span>
          <span className="stats__stat-label">{t.stats.totalAnswered}</span>
        </div>
        <div className="stats__stat stats__stat--learned">
          <span className="stats__stat-value">{summary.learned}</span>
          <span className="stats__stat-label">{t.stats.learned}</span>
        </div>
        <div className="stats__stat stats__stat--progress">
          <span className="stats__stat-value">{summary.inProgress}</span>
          <span className="stats__stat-label">{t.stats.inProgress}</span>
        </div>
        <div className="stats__stat">
          <span className="stats__stat-value">{summary.accuracy}%</span>
          <span className="stats__stat-label">{t.stats.accuracy}</span>
        </div>
      </div>

      <div className="stats__activity">
        <h3 className="stats__activity-title">{t.stats.activity}</h3>
        <div className="stats__periods">
          {periods.map(p => (
            <div key={p.label} className="stats__period-card">
              <div className="stats__period-label">{p.label}</div>
              <div className="stats__period-rows">
                <div className="stats__period-row">
                  <span>{t.stats.listenSessions}</span>
                  <span>{p.data.listenSessions}</span>
                </div>
                <div className="stats__period-row">
                  <span>{t.stats.speakSessions}</span>
                  <span>{p.data.speakSessions}</span>
                </div>
                <div className="stats__period-row">
                  <span>{t.stats.correctAnswers}</span>
                  <span className="stats__period-val--correct">{p.data.correctAnswers}</span>
                </div>
                <div className="stats__period-row">
                  <span>{t.stats.totalAnswers}</span>
                  <span>{p.data.totalAnswers}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {problemList.length > 0 && (
        <div className="stats__problems">
          <h3 className="stats__problems-title">{t.stats.problemProblems}</h3>
          <div className="stats__problem-list">
            {problemList.map((display, i) => (
              <div key={i} className="stats__problem-item">{display}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
