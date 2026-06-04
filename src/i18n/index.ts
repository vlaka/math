import { ru } from './ru'
import { he } from './he'

export type Lang = 'ru' | 'he'

export interface Translations {
  appTitle: string
  home: {
    title: string
    subtitle: string
    startListening: string
    startSpeaking: string
    settings: string
    stats: string
    quest: string
  }
  card: {
    showAnswer: string
    know: string
    learning: string
    next: string
    tryAgain: string
    showCorrect: string
    speak: string
    listening: string
    correct: string
    tryMore: string
    micUnavailable: string
    submit: string
    clear: string
  }
  levels: {
    title: string
    difficulty1: string
    difficulty2: string
    add: string
    sub: string
    mul: string
    div: string
    mixed: string
  }
  settings: {
    title: string
    language: string
    resetProgress: string
    resetConfirm: string
    back: string
  }
  stats: {
    title: string
    totalAnswered: string
    learned: string
    inProgress: string
    accuracy: string
    problemProblems: string
    back: string
    activity: string
    today: string
    thisMonth: string
    thisYear: string
    listenSessions: string
    speakSessions: string
    correctAnswers: string
    totalAnswers: string
  }
  quest: {
    title: string
    questName: string
    questNamePlaceholder: string
    level: string
    problemCount: string
    mode: string
    modeListen: string
    modeSpeak: string
    start: string
    completed: string
    score: string
    time: string
    minutes: string
    seconds: string
    backHome: string
  }
  done: {
    title: string
    subtitle: string
    restart: string
    backToLevels: string
  }
}

const translations: Record<Lang, Translations> = { ru, he }

export function t(lang: Lang): Translations {
  return translations[lang]
}
