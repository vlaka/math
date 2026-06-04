import { LEVEL_COUNT, getLevelDifficultyLabel, getLevelTitle, levelIconUrl } from '../data/levels'
import type { Translations } from '../i18n'
import './LevelSelector.css'

interface LevelSelectorProps {
  t: Translations
  onSelect: (level: number) => void
  onBack: () => void
}

export function LevelSelector({ t, onSelect, onBack }: LevelSelectorProps) {
  return (
    <div className="levels">
      <div className="levels__header">
        <button className="levels__back" onClick={onBack}>←</button>
        <h2 className="levels__title">{t.levels.title}</h2>
      </div>

      <div className="levels__grid">
        {Array.from({ length: LEVEL_COUNT }, (_, i) => i + 1).map(level => {
          const difficulty = getLevelDifficultyLabel(level, t)

          return (
            <button key={level} className="levels__card" onClick={() => onSelect(level)}>
              <img
                className="levels__card-icon"
                src={levelIconUrl(level)}
                alt={getLevelTitle(level, t)}
                width={48}
                height={48}
              />
              <div className="levels__card-info">
                <h3 className="levels__card-title">{getLevelTitle(level, t)}</h3>
                <span className="levels__card-badge">{difficulty}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
