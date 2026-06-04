import { useState } from 'react'
import { Home } from './components/Home'
import { LevelSelector } from './components/LevelSelector'
import { ProblemDeck } from './components/ProblemDeck'
import { QuestSetup } from './components/QuestSetup'
import type { QuestConfig } from './components/QuestSetup'
import { QuestDeck } from './components/QuestDeck'
import { Settings } from './components/Settings'
import { Stats } from './components/Stats'
import { t as getT } from './i18n'
import type { Lang } from './i18n'
import { useActivityLog } from './hooks/useActivityLog'
import './App.css'

type Screen = 'home' | 'levels' | 'deck' | 'quest-setup' | 'quest-play' | 'settings' | 'stats'

const LANG_KEY = 'math-lang'
const DEBUG_KEY = 'math-debug'

function loadLang(): Lang {
  const saved = localStorage.getItem(LANG_KEY)
  return saved === 'he' || saved === 'ru' ? saved : 'ru'
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [lang, setLang] = useState<Lang>(loadLang)
  const [mode, setMode] = useState<'listen' | 'speak'>('listen')
  const [level, setLevel] = useState(1)
  const [micAvailable] = useState(
    () => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
  )
  const [debug, setDebug] = useState(() => localStorage.getItem(DEBUG_KEY) === '1')
  const [questConfig, setQuestConfig] = useState<QuestConfig | null>(null)

  const { logSession, logAnswer, today, month, year } = useActivityLog()
  const translations = getT(lang)

  const changeLang = (newLang: Lang) => {
    setLang(newLang)
    localStorage.setItem(LANG_KEY, newLang)
  }

  const toggleDebug = () => {
    setDebug(prev => {
      const next = !prev
      localStorage.setItem(DEBUG_KEY, next ? '1' : '0')
      return next
    })
  }

  const startMode = (m: 'listen' | 'speak') => {
    setMode(m)
    setScreen('levels')
  }

  const selectLevel = (lvl: number) => {
    setLevel(lvl)
    setScreen('deck')
    logSession(mode)
  }

  const dir = lang === 'he' ? 'rtl' : 'ltr'

  return (
    <div className="app" dir={dir} data-lang={lang}>
      {screen === 'home' && (
        <Home
          t={translations}
          micAvailable={micAvailable}
          onStartListening={() => startMode('listen')}
          onStartSpeaking={() => startMode('speak')}
          onSettings={() => setScreen('settings')}
          onStats={() => setScreen('stats')}
          onQuest={() => setScreen('quest-setup')}
        />
      )}

      {screen === 'levels' && (
        <LevelSelector
          t={translations}
          onSelect={selectLevel}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'deck' && (
        <ProblemDeck
          key={`${level}-${mode}`}
          level={level}
          mode={mode}
          lang={lang}
          t={translations}
          debug={debug}
          onBack={() => setScreen('levels')}
          onLogAnswer={logAnswer}
        />
      )}

      {screen === 'quest-setup' && (
        <QuestSetup
          t={translations}
          lang={lang}
          micAvailable={micAvailable}
          onStart={(cfg) => {
            setQuestConfig(cfg)
            setScreen('quest-play')
            logSession(cfg.mode)
          }}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'quest-play' && questConfig && (
        <QuestDeck
          key={`quest-${questConfig.name}-${questConfig.level}-${questConfig.problemCount}`}
          config={questConfig}
          lang={lang}
          t={translations}
          debug={debug}
          onBack={() => setScreen('home')}
          onLogAnswer={logAnswer}
        />
      )}

      {screen === 'settings' && (
        <Settings
          t={translations}
          lang={lang}
          debug={debug}
          onChangeLang={changeLang}
          onToggleDebug={toggleDebug}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'stats' && (
        <Stats
          t={translations}
          onBack={() => setScreen('home')}
          today={today}
          month={month}
          year={year}
        />
      )}
    </div>
  )
}

export default App
