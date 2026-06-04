import type { Lang } from '../i18n'

const RU_ONES = [
  'ноль', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять',
  'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать',
  'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать',
]

const RU_TENS = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девятьдесят']

const RU_HUNDREDS = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот']

const HE_ONES = ['אפס', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר']

const HE_TENS = ['', 'עשר', 'עשרים', 'שלושים', 'ארבעים', 'חמישים', 'שישים', 'שבעים', 'שמונים', 'תשעים']

const HE_HUNDREDS = ['', 'מאה', 'מאתיים', 'שלוש מאות', 'ארבע מאות', 'חמש מאות', 'שש מאות', 'שבע מאות', 'שמונה מאות', 'תשע מאות']

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractDigits(text: string): number | null {
  const match = text.match(/\d+/)
  return match ? parseInt(match[0], 10) : null
}

function parseRussianWords(text: string): number | null {
  let t = normalizeText(text)
  t = t.replace(/одна|одну/g, 'один')
  t = t.replace(/две|двух/g, 'два')

  if (RU_ONES.includes(t)) return RU_ONES.indexOf(t)
  if (t === 'тысяча' || t === 'тысячи') return 1000

  let total = 0
  let rest = t

  const thousandMatch = rest.match(/(\d+|один|два|три|четыре|пять|шесть|семь|восемь|девять)\s*тысяч/)
  if (thousandMatch) {
    const n = parseRussianWords(thousandMatch[1]) ?? extractDigits(thousandMatch[1])
    if (n != null) total += n * 1000
    rest = rest.replace(thousandMatch[0], '').trim()
  }

  for (let h = 9; h >= 1; h--) {
    if (rest.includes(RU_HUNDREDS[h])) {
      total += h * 100
      rest = rest.replace(RU_HUNDREDS[h], '').trim()
      break
    }
  }

  for (let tens = 9; tens >= 2; tens--) {
    if (rest.includes(RU_TENS[tens])) {
      total += tens * 10
      rest = rest.replace(RU_TENS[tens], '').trim()
      break
    }
  }

  for (let i = RU_ONES.length - 1; i >= 0; i--) {
    if (rest.includes(RU_ONES[i])) {
      total += i
      rest = rest.replace(RU_ONES[i], '').trim()
      break
    }
  }

  if (rest === '' && total > 0) return total
  if (total > 0 && rest === '') return total
  return null
}

function parseHebrewWords(text: string): number | null {
  let t = normalizeText(text)
  t = t.replace(/ו/g, ' ')

  if (HE_ONES.includes(t)) return HE_ONES.indexOf(t)

  let total = 0
  let rest = t

  for (let h = 9; h >= 1; h--) {
    const form = HE_HUNDREDS[h]
    if (rest.includes(form)) {
      total += h * 100
      rest = rest.replace(form, '').trim()
      break
    }
  }

  for (let tens = 9; tens >= 1; tens--) {
    if (rest.includes(HE_TENS[tens])) {
      total += tens * 10
      rest = rest.replace(HE_TENS[tens], '').trim()
      break
    }
  }

  for (let i = HE_ONES.length - 1; i >= 0; i--) {
    if (rest.includes(HE_ONES[i])) {
      total += i
      rest = rest.replace(HE_ONES[i], '').trim()
      break
    }
  }

  if (total > 0 && rest === '') return total
  return null
}

export function parseNumber(text: string, lang: Lang): number | null {
  if (!text.trim()) return null

  const digits = extractDigits(text)
  if (digits != null) return digits

  const normalized = normalizeText(text)
  if (lang === 'he') {
    return parseHebrewWords(normalized)
  }
  return parseRussianWords(normalized)
}

export function numbersMatch(recognized: string, expected: number, lang: Lang): boolean {
  const parsed = parseNumber(recognized, lang)
  return parsed === expected
}
