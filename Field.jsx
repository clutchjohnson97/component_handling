export function NumberField({ label, hint, value, onChange, unit, step = 'any', min }) {
  return (
    <div className="field-row">
      <label>
        {label}
        {hint && <span className="hint">{hint}</span>}
      </label>
      <div className="field-input">
        <input
          type="number"
          step={step}
          min={min}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        {unit && <span className="unit">{unit}</span>}
      </div>
    </div>
  )
}

export function SelectField({ label, hint, value, onChange, options }) {
  return (
    <div className="field-row">
      <label>
        {label}
        {hint && <span className="hint">{hint}</span>}
      </label>
      <div className="field-input">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function SegmentedField({ label, value, onChange, options }) {
  return (
    <div className="field-row">
      <label>{label}</label>
      <div className="seg-control" style={{ width: 128, flexShrink: 0 }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            className={value === opt.value ? 'active' : ''}
            onClick={() => onChange(opt.value)}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
