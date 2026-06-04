import './NumericKeypad.css'

interface NumericKeypadProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  clearLabel: string
  submitLabel: string
  disabled?: boolean
}

export function NumericKeypad({
  value,
  onChange,
  onSubmit,
  clearLabel,
  submitLabel,
  disabled,
}: NumericKeypadProps) {
  const press = (digit: string) => {
    if (disabled || value.length >= 4) return
    onChange(value + digit)
  }

  const backspace = () => {
    if (disabled) return
    onChange(value.slice(0, -1))
  }

  return (
    <div className="keypad">
      <div className="keypad__display">{value || '?'}</div>
      <div className="keypad__grid">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
          <button
            key={d}
            type="button"
            className="keypad__key"
            onClick={() => press(d)}
            disabled={disabled}
          >
            {d}
          </button>
        ))}
        <button type="button" className="keypad__key keypad__key--action" onClick={backspace} disabled={disabled}>
          {clearLabel}
        </button>
        <button type="button" className="keypad__key" onClick={() => press('0')} disabled={disabled}>
          0
        </button>
        <button
          type="button"
          className="keypad__key keypad__key--submit"
          onClick={onSubmit}
          disabled={disabled || !value}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}
