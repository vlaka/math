import { useState, useCallback } from 'react'
import { levelOptions } from '../utils/levelOptions'
import type { Lang, Translations } from '../i18n'
import './QuestSetup.css'

export interface QuestConfig {
  name: string
  level: number
  problemCount: number
  mode: 'listen' | 'speak'
}

interface QuestSetupProps {
  t: Translations
  lang: Lang
  micAvailable: boolean
  onStart: (config: QuestConfig) => void
  onBack: () => void
}

export function QuestSetup({ t, lang, micAvailable, onStart, onBack }: QuestSetupProps) {
  const [name, setName] = useState('')
  const [dictating, setDictating] = useState(false)
  const [level, setLevel] = useState(1)
  const [problemCount, setProblemCount] = useState(20)
  const [mode, setMode] = useState<'listen' | 'speak'>('speak')

  const startDictation = useCallback(() => {
    const SpeechAPI =
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition ||
      (window as unknown as Record<string, unknown>).SpeechRecognition
    if (!SpeechAPI) return

    setDictating(true)
    const recognition = new (SpeechAPI as new () => {
      lang: string
      interimResults: boolean
      maxAlternatives: number
      onresult: ((e: { results: SpeechRecognitionResultList }) => void) | null
      onerror: (() => void) | null
      onend: (() => void) | null
      start(): void
    })()
    recognition.lang = lang === 'he' ? 'he-IL' : 'ru-RU'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript
      if (text) setName(prev => prev ? `${prev} ${text}` : text)
      setDictating(false)
    }
    recognition.onerror = () => setDictating(false)
    recognition.onend = () => setDictating(false)
    recognition.start()
  }, [lang])

  const handleStart = () => {
    if (!name.trim()) return
    onStart({
      name: name.trim(),
      level,
      problemCount: Math.max(5, Math.min(problemCount, 100)),
      mode,
    })
  }

  return (
    <div className="quest-setup">
      <div className="quest-setup__header">
        <button className="quest-setup__back" onClick={onBack}>←</button>
        <h2 className="quest-setup__title">{t.quest.title}</h2>
      </div>

      <div className="quest-setup__form">
        <div className="quest-setup__field">
          <label className="quest-setup__label">{t.quest.questName}</label>
          <div className="quest-setup__input-row">
            <div className="quest-setup__input-wrap">
              <input
                className="quest-setup__input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t.quest.questNamePlaceholder}
                maxLength={50}
              />
              {name && (
                <button className="quest-setup__clear-btn" onClick={() => setName('')} type="button">
                  ✕
                </button>
              )}
            </div>
            {micAvailable && (
              <button
                className={`quest-setup__mic-btn ${dictating ? 'quest-setup__mic-btn--active' : ''}`}
                onClick={startDictation}
                disabled={dictating}
                type="button"
              >
                🎤
              </button>
            )}
          </div>
        </div>

        <div className="quest-setup__field">
          <label className="quest-setup__label">{t.quest.level}</label>
          <select
            className="quest-setup__select"
            value={level}
            onChange={e => setLevel(Number(e.target.value))}
          >
            {levelOptions(t).map(opt => (
              <option key={opt.level} value={opt.level}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="quest-setup__field">
          <label className="quest-setup__label">
            {t.quest.problemCount}: <strong>{problemCount}</strong>
          </label>
          <input
            className="quest-setup__range"
            type="range"
            min={5}
            max={100}
            value={problemCount}
            onChange={e => setProblemCount(Number(e.target.value))}
          />
          <div className="quest-setup__range-labels">
            <span>5</span>
            <span>100</span>
          </div>
        </div>

        <div className="quest-setup__field">
          <label className="quest-setup__label">{t.quest.mode}</label>
          <div className="quest-setup__modes">
            <button
              className={`quest-setup__mode-btn ${mode === 'listen' ? 'quest-setup__mode-btn--active' : ''}`}
              onClick={() => setMode('listen')}
            >
              👀 {t.quest.modeListen}
            </button>
            {micAvailable && (
              <button
                className={`quest-setup__mode-btn ${mode === 'speak' ? 'quest-setup__mode-btn--active' : ''}`}
                onClick={() => setMode('speak')}
              >
                🎤 {t.quest.modeSpeak}
              </button>
            )}
          </div>
        </div>

        <button className="quest-setup__start" onClick={handleStart} disabled={!name.trim()}>
          {t.quest.start}
        </button>
      </div>
    </div>
  )
}
