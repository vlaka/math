import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const iconsDir = join(publicDir, 'icons')

mkdirSync(iconsDir, { recursive: true })

const BLUE_LIGHT = '#5B8DEF'
const BLUE_DARK = '#2B5FD9'
const YELLOW = '#FFD23F'
const YELLOW_DARK = '#F4B400'

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function iconSvg({ symbols, size = 512 }) {
  const symbolMarkup = symbols
    .map(({ char, x, y, size: fontSize }) => `
      <text
        x="${x}"
        y="${y}"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="Nunito, Arial, Helvetica, sans-serif"
        font-weight="900"
        font-size="${fontSize}"
        fill="${YELLOW}"
        stroke="${YELLOW_DARK}"
        stroke-width="3"
        paint-order="stroke fill"
        filter="url(#glow)"
      >${escapeXml(char)}</text>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="68%">
      <stop offset="0%" stop-color="${BLUE_LIGHT}"/>
      <stop offset="100%" stop-color="${BLUE_DARK}"/>
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#14366B" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  ${symbolMarkup}
</svg>`
}

const layouts = {
  allFour: [
    { char: '+', x: 168, y: 195, size: 165 },
    { char: '−', x: 344, y: 195, size: 165 },
    { char: '×', x: 168, y: 355, size: 165 },
    { char: '÷', x: 344, y: 355, size: 165 },
  ],
  add: [{ char: '+', x: 256, y: 268, size: 300 }],
  sub: [{ char: '−', x: 256, y: 255, size: 300 }],
  mul: [{ char: '×', x: 256, y: 268, size: 300 }],
  div: [{ char: '÷', x: 256, y: 268, size: 300 }],
}

async function writePng(name, symbols, size) {
  const svg = iconSvg({ symbols, size })
  const svgPath = join(name.startsWith('level-') ? iconsDir : publicDir, `${name}.svg`)
  writeFileSync(svgPath, svg)

  const pngPath = join(name.startsWith('level-') ? iconsDir : publicDir, `${name}.png`)
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(pngPath)
}

await writePng('favicon', layouts.allFour, 64)
await writePng('pwa-192x192', layouts.allFour, 192)
await writePng('pwa-512x512', layouts.allFour, 512)
await writePng('level-add', layouts.add, 128)
await writePng('level-sub', layouts.sub, 128)
await writePng('level-mul', layouts.mul, 128)
await writePng('level-div', layouts.div, 128)
await writePng('level-mixed', layouts.allFour, 128)

console.log('Icons generated in public/ and public/icons/')
