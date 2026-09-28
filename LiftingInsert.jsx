import { useMemo, useState } from 'react'
import { NumberField } from '../components/Field'
import { ResultRow, Verdict, DcrBar, SummaryCard } from '../components/Results'
import { liftingInsertAnalysis } from '../lib/pciFormulas'

export default function LiftingInsert() {
  const [P, setP] = useState(2.29)
  const [TN, setTN] = useState(4.6)
  const [fc, setFc] = useState(2500)
  const [angle, setAngle] = useState(0)

  const r = useMemo(() => liftingInsertAnalysis({ P, TN, fc, angleDeg: angle }), [P, TN, fc, angle])

  return (
    <div className="module-grid">
      <div>
        <div className="panel">
          <h2>Insert &amp; load inputs</h2>
          <NumberField label="Applied vertical load, P" hint="load carried by this insert" value={P} onChange={setP} unit="kip" />
          <NumberField label="Rated capacity, TN" hint="mfr. rating at 3,500 psi, vertical pick" value={TN} onChange={setTN} unit="kip" />
          <NumberField label="Concrete strength at pick" value={fc} onChange={setFc} unit="psi" />
          <NumberField label="Rigging angle from vertical" value={angle} onChange={setAngle} unit="deg" />
        </div>
      </div>

      <div>
        <div className="panel">
          <h2>Result summary</h2>
          <div className="summary-grid">
            <SummaryCard label="Required tension" value={`${r.requiredTension.toFixed(2)} kip`} ok={r.OK} />
            <SummaryCard label="Adjusted capacity, TNR" value={`${r.TNR.toFixed(2)} kip`} />
          </div>
        </div>

        <div className="panel">
          <h3>Concrete-strength adjustment <span className="code-ref">PCI DH §8.3</span></h3>
          <ResultRow label="TN (rated at 3,500 psi)" value={`${TN.toFixed(2)} kip`} />
          <ResultRow label="√(f'c / 3500)" value={Math.sqrt(fc / 3500).toFixed(3)} />
          <ResultRow label="TNR = TN·√(f'c/3500)" value={`${r.TNR.toFixed(2)} kip`} emph />

          <h3>Angled-pick resolution</h3>
          <ResultRow label="Applied load, P" value={`${P.toFixed(2)} kip`} />
          <ResultRow label="Rigging angle from vertical, θ" value={`${angle}°`} />
          <ResultRow label="Required tension = P / cos(θ)" value={`${r.requiredTension.toFixed(2)} kip`} emph />
          <div className="result-row">
            <span className="label">DCR = required tension / TNR</span>
            <span className="value">
              {r.DCR.toFixed(2)} &nbsp;<Verdict ok={r.OK} />
            </span>
          </div>
          <DcrBar dcr={r.DCR} />

          <div className="note warn">
            The cos(θ) resolution is the theoretical lower-bound cable
            tension for a straight-line pick and does not include the
            additional bending/prying that many embedded lifting anchors
            see under an inclined load. Manufacturer literature (e.g. CONAC-
            or Dayton-Superior-type lifting anchor tables) typically
            publishes reduced angled-pick ratings — use the concrete-strength-
            adjusted TNR at 0° only when the pick is truly vertical, and
            substitute the manufacturer's specific angled rating whenever
            θ &gt; 0.
          </div>
        </div>
      </div>
    </div>
  )
}
