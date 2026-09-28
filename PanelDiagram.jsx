import { LIFT_POINT_FRACTIONS } from '../lib/pciFormulas'

function fmtFt(ftValue) {
  const totalIn = Math.round(ftValue * 12)
  const ft = Math.floor(totalIn / 12)
  const inch = totalIn % 12
  return inch === 0 ? `${ft}'-0"` : `${ft}'-${inch}"`
}

/** Returns lift point positions as fractions [0,1] along a and along b. */
function liftPointFractions(N) {
  const cfg = LIFT_POINT_FRACTIONS[N]
  if (N === 4) {
    return {
      aFracs: [cfg.aInset, 1 - cfg.aInset],
      bFracs: [cfg.bInset, 1 - cfg.bInset],
    }
  }
  return {
    aFracs: [cfg.aInset, 1 - cfg.aInset],
    bFracs: cfg.bFractions,
  }
}

export default function PanelDiagram({ a, b, N }) {
  const { aFracs, bFracs } = liftPointFractions(N)

  // ---- Plan view geometry ----
  const PW = 640 // drawing width budget for the long dimension
  const scale = PW / a
  const planW = a * scale
  const planH = Math.max(Math.min(b * scale, 170), 70)

  const marginL = 70
  const marginT = 46
  const svgW = marginL + planW + 40
  const planPoints = []
  for (const af of aFracs) {
    for (const bf of bFracs) {
      planPoints.push({ x: marginL + af * planW, y: marginT + bf * planH })
    }
  }

  // Unique sorted fractional positions for dimensioning
  const aUnique = [...new Set(aFracs)].sort((x, y) => x - y)
  const bUnique = [...new Set(bFracs)].sort((x, y) => x - y)
  const aDimSegs = []
  let prevA = 0
  for (const f of aUnique) {
    aDimSegs.push({ from: prevA, to: f })
    prevA = f
  }
  aDimSegs.push({ from: prevA, to: 1 })
  const bDimSegs = []
  let prevB = 0
  for (const f of bUnique) {
    bDimSegs.push({ from: prevB, to: f })
    prevB = f
  }
  bDimSegs.push({ from: prevB, to: 1 })

  const planH_total = marginT + planH + 40

  // ---- Elevation / forces view geometry ----
  const EW = planW
  const EX0 = marginL
  const EY = planH_total + 60
  const sag = 14
  // Schematic only: shows the reaction lines along the elevation's length,
  // using whichever fraction set has more pick lines for the given N.
  const liftFracs = N === 8 ? bFracs : aFracs
  const liftXs = liftFracs.map((f) => EX0 + f * EW)

  const beamY = EY
  const pathD = `M ${EX0} ${beamY} Q ${EX0 + EW / 2} ${beamY + sag} ${EX0 + EW} ${beamY}`

  const totalH = EY + 150

  return (
    <svg viewBox={`0 0 ${svgW} ${totalH}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <marker id="arrowUp" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,10 L5,0 L10,10 Z" fill="var(--accent)" />
        </marker>
        <marker id="arrowT" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M10,0 L0,5 L10,10 Z" fill="var(--tension)" />
        </marker>
      </defs>

      {/* ================= PLAN VIEW ================= */}
      <text x={marginL} y={20} fill="var(--text-muted)" fontSize="11" fontFamily="var(--font-ui)">
        PLAN — {N}-POINT PICKUP
      </text>

      {/* panel outline */}
      <rect
        x={marginL}
        y={marginT}
        width={planW}
        height={planH}
        fill="var(--bg-raised)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />

      {/* a-dimension line (top) */}
      <g fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
        <line x1={marginL} y1={marginT - 14} x2={marginL + planW} y2={marginT - 14} stroke="var(--border)" />
        {aDimSegs.map((seg, i) => {
          const x1 = marginL + seg.from * planW
          const x2 = marginL + seg.to * planW
          const len = (seg.to - seg.from) * a
          return (
            <g key={i}>
              <line x1={x1} y1={marginT - 18} x2={x1} y2={marginT - 10} stroke="var(--border)" />
              <line x1={x2} y1={marginT - 18} x2={x2} y2={marginT - 10} stroke="var(--border)" />
              <text x={(x1 + x2) / 2} y={marginT - 20} textAnchor="middle">
                {fmtFt(len)}
              </text>
            </g>
          )
        })}
      </g>

      {/* b-dimension line (right) */}
      <g fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
        {bDimSegs.map((seg, i) => {
          const y1 = marginT + seg.from * planH
          const y2 = marginT + seg.to * planH
          const len = (seg.to - seg.from) * b
          const xLine = marginL + planW + 16
          return (
            <g key={i}>
              <line x1={xLine - 4} y1={y1} x2={xLine + 4} y2={y1} stroke="var(--border)" />
              <line x1={xLine - 4} y1={y2} x2={xLine + 4} y2={y2} stroke="var(--border)" />
              <line x1={xLine} y1={y1} x2={xLine} y2={y2} stroke="var(--border)" />
              <text x={xLine + 10} y={(y1 + y2) / 2 + 3} textAnchor="start">
                {fmtFt(len)}
              </text>
            </g>
          )
        })}
      </g>

      {/* lift points */}
      {planPoints.map((p, i) => (
        <g key={i}>
          <path
            d={`M ${p.x} ${p.y - 6} L ${p.x + 6} ${p.y + 5} L ${p.x - 6} ${p.y + 5} Z`}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
          />
          <circle cx={p.x} cy={p.y} r="1.6" fill="var(--accent)" />
        </g>
      ))}

      {/* ================= ELEVATION / FORCES VIEW ================= */}
      <text x={marginL} y={EY - 60} fill="var(--text-muted)" fontSize="11" fontFamily="var(--font-ui)">
        FORCES DURING LIFT
      </text>

      {/* reaction arrows */}
      {liftXs.map((x, i) => (
        <g key={i}>
          <line x1={x} y1={beamY - 34} x2={x} y2={beamY - 4} stroke="var(--accent)" strokeWidth="1.6" markerEnd="url(#arrowUp)" />
          <text x={x} y={beamY - 40} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--accent)">
            R
          </text>
        </g>
      ))}

      {/* sagging panel */}
      <path d={pathD} fill="none" stroke="var(--text-primary)" strokeWidth="3" />
      <path
        d={`M ${EX0} ${beamY + 10} Q ${EX0 + EW / 2} ${beamY + sag + 10} ${EX0 + EW} ${beamY + 10}`}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <text x={EX0 + EW / 2} y={beamY + sag + 24} textAnchor="middle" fontSize="9.5" fill="var(--accent)" fontFamily="var(--font-ui)">
        neutral axis
      </text>

      {/* moment arc */}
      <path
        d={`M ${EX0 + EW / 2 - 22} ${beamY + 46} A 22 14 0 0 1 ${EX0 + EW / 2 + 22} ${beamY + 46}`}
        fill="none"
        stroke="var(--text-muted)"
        strokeWidth="1.4"
      />
      <text x={EX0 + EW / 2} y={beamY + 66} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">
        M
      </text>

      {/* tension line at bottom */}
      <line x1={EX0 + 4} y1={beamY + 92} x2={EX0 + EW - 4} y2={beamY + 92} stroke="var(--tension)" strokeWidth="1.6" markerStart="url(#arrowT)" markerEnd="url(#arrowT)" />
      <text x={EX0} y={beamY + 108} fontSize="10" fontFamily="var(--font-mono)" fill="var(--tension)">
        T
      </text>
      <text x={EX0 + EW} y={beamY + 108} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--tension)">
        T
      </text>
      <text x={EX0 + EW / 2} y={beamY + 122} textAnchor="middle" fontSize="9.5" fill="var(--tension)" fontFamily="var(--font-ui)">
        tension zone (bottom fiber)
      </text>
    </svg>
  )
}
