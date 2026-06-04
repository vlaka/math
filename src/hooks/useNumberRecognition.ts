import { useCallback, useRef, useState } from 'react'
import type { Lang } from '../i18n'
import { numbersMatch } from '../utils/parseNumber'

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
}

type RecognitionStatus = 'idle' | 'listening' | 'processing'

const LISTEN_TIMEOUT_MS = 8000
const MAX_RESTARTS = 5
const RESTART_DELAY_MS = 300

const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)

type SpeechRecognitionInstance = InstanceType<typeof webkitSpeechRecognition>

export function useNumberRecognition(lang: Lang) {
  const [status, setStatus] = useState<RecognitionStatus>('idle')
  const [available, setAvailable] = useState(
    () => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
  )
  const [result, setResult] = useState<string | null>(null)
  const [interimText, setInterimText] = useState<string | null>(null)
  const [debugLog, setDebugLog] = useState<string[]>([])
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resolvedRef = useRef(false)
  const restartCountRef = useRef(0)
  const bestInterimRef = useRef<string | null>(null)

  const recognitionLang = lang === 'he' ? 'he-IL' : 'ru-RU'

  const addDebug = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setDebugLog(prev => [...prev.slice(-19), `${ts} ${msg}`])
  }, [])

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const listen = useCallback((expectedAnswer: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const SpeechRecognitionAPI =
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition ||
        (window as unknown as Record<string, unknown>).SpeechRecognition

      if (!SpeechRecognitionAPI) {
        addDebug('ERR: no API found')
        resolve(false)
        return
      }

      resolvedRef.current = false
      restartCountRef.current = 0
      bestInterimRef.current = null

      setStatus('listening')
      setResult(null)
      setInterimText(null)
      addDebug(`listen start, expected=${expectedAnswer} lang=${recognitionLang}`)

      const finishWith = (matched: boolean, transcript: string | null) => {
        if (resolvedRef.current) return
        resolvedRef.current = true
        clearTimer()
        try { recognitionRef.current?.stop() } catch { /* already stopped */ }
        recognitionRef.current = null
        setResult(transcript)
        setInterimText(null)
        setStatus('idle')
        addDebug(`finish: matched=${matched} text="${transcript}"`)
        resolve(matched)
      }

      const finishFromTimeout = () => {
        if (resolvedRef.current) return
        const lastHeard = bestInterimRef.current
        if (lastHeard && numbersMatch(lastHeard, expectedAnswer, lang)) {
          finishWith(true, lastHeard)
        } else {
          finishWith(false, lastHeard)
        }
      }

      timeoutRef.current = setTimeout(finishFromTimeout, LISTEN_TIMEOUT_MS)

      const createRecognition = () => {
        const recognition = new (SpeechRecognitionAPI as new () => SpeechRecognitionInstance)()
        recognition.lang = recognitionLang
        recognition.continuous = !isMobile
        recognition.interimResults = true
        recognition.maxAlternatives = 5
        recognitionRef.current = recognition

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          if (resolvedRef.current) return

          for (let r = event.resultIndex; r < event.results.length; r++) {
            const res = event.results[r]

            if (res.isFinal) {
              addDebug(`result FINAL: "${res[0].transcript}"`)
              for (let i = 0; i < res.length; i++) {
                const t = res[i].transcript
                bestInterimRef.current = t
                if (numbersMatch(t, expectedAnswer, lang)) {
                  finishWith(true, t)
                  return
                }
              }
              finishWith(false, res[0].transcript)
              return
            }

            const interim = res[0].transcript
            bestInterimRef.current = interim
            setInterimText(interim)

            if (numbersMatch(interim, expectedAnswer, lang)) {
              clearTimer()
              timeoutRef.current = setTimeout(() => {
                if (!resolvedRef.current) {
                  finishWith(true, interim)
                }
              }, 1500)
            }
          }
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          addDebug(`error: ${event.error}`)
          if (resolvedRef.current) return
          if (event.error === 'no-speech' || event.error === 'aborted') return
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            finishWith(false, null)
            setAvailable(false)
            return
          }
          finishWith(false, null)
        }

        recognition.onend = () => {
          if (resolvedRef.current) return
          restartCountRef.current++
          if (restartCountRef.current < MAX_RESTARTS) {
            setTimeout(() => {
              if (resolvedRef.current) return
              try {
                createRecognition().start()
              } catch {
                finishFromTimeout()
              }
            }, RESTART_DELAY_MS)
          } else {
            finishFromTimeout()
          }
        }

        return recognition
      }

      try {
        createRecognition().start()
      } catch (e) {
        addDebug(`start failed: ${e}`)
        finishWith(false, null)
      }
    })
  }, [addDebug, clearTimer, lang, recognitionLang])

  const stop = useCallback(() => {
    clearTimer()
    resolvedRef.current = true
    try { recognitionRef.current?.stop() } catch { /* ok */ }
    recognitionRef.current = null
    setStatus('idle')
    setInterimText(null)
  }, [clearTimer])

  return { listen, stop, status, available, result, interimText, debugLog }
}

declare global {
  var webkitSpeechRecognition: new () => {
    lang: string
    continuous: boolean
    interimResults: boolean
    maxAlternatives: number
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onend: (() => void) | null
    start(): void
    stop(): void
  }
}
