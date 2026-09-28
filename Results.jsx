export function ResultRow({ label, value, emph }) {
  return (
    <div className="result-row">
      <span className="label">{label}</span>
      <span className={`value ${emph ? 'emph' : ''}`}>{value}</span>
    </div>
  )
}

export function Verdict({ ok }) {
  return <span className={`verdict ${ok ? 'ok' : 'ng'}`}>{ok ? 'OK' : 'NG'}</span>
}

export function DcrBar({ dcr }) {
  const pct = Math.min(dcr * 100, 100)
  const color = dcr <= 1 ? 'var(--ok)' : 'var(--tension)'
  return (
    <div className="dcr-bar-track">
      <div className="dcr-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export function SummaryCard({ label, value, ok }) {
  return (
    <div className="summary-card">
      <span className="label" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {label}
      </span>
      <div className="big" style={{ color: ok === undefined ? 'var(--text-primary)' : ok ? 'var(--ok)' : 'var(--tension)' }}>
        {value}
      </div>
    </div>
  )
}
