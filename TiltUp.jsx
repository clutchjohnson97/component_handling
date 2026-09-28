import { useMemo, useState } from 'react'
import { NumberField, SegmentedField } from '../components/Field'
import { ResultRow, Verdict, DcrBar, SummaryCard } from '../components/Results'
import { stripAnalysis, tiltUpAnalysis } from '../lib/pciFormulas'

export default function TiltUp() {
  const [a, setA] = useState(13.25)
  const [b, setB] = useState(13.84)
  const [t, setT] = useState(8)
  const [rt, setRt] = useState(0.75)
  const [gamma, setGamma] = useState(150)
  const [fc, setFc] = useState(3000)
  const [N, setN] = useState(4)
  const [TN, setTN] = useState(4.6)
  const [dfConcrete, setDfConcrete] = useState(1.2)
  const [dfHardware, setDfHardware] = useState(1.5)
  const [slingAngle, setSlingAngle] = useState(15)

  const strip = useMemo(
    () => stripAnalysis({ a, b, t, rt, gamma, fc, N, TN }),
    [a, b, t, rt, gamma, fc, N, TN]
  )

  const r = useMemo(
    () => tiltUpAnalysis({ strip, fc, N, TN, dfConcrete, dfHardware, slingAngleDeg: slingAngle }),
    [strip, fc, N, TN, dfConcrete, dfHardware, slingAngle]
  )

  return (
    <div className="module-grid">
      <div>
        <div className="panel">
          <h2>Panel geometry</h2>
          <NumberField label="Long dimension, a" value={a} onChange={setA} unit="ft" />
          <NumberField label="Short dimension, b" value={b} onChange={setB} unit="ft" />
          <NumberField label="Thickness, t" value={t} onChange={setT} unit="in" />
          <NumberField label="Reveal / blockout depth" value={rt} onChange={setRt} unit="in" />
          <NumberField label="Unit weight, γ" value={gamma} onChange={setGamma} unit="pcf" />
        </div>

        <div className="panel">
          <h2>Erection parameters</h2>
          <NumberField label="Concrete strength at erection" value={fc} onChange={setFc} unit="psi" />
          <SegmentedField
            label="Pickup points, N"
            value={N}
            onChange={(v) => setN(parseInt(v))}
            options={[
              { value: 4, label: '4-pt' },
              { value: 8, label: '8-pt' },
            ]}
          />
          <NumberField label="Rated lifter capacity" hint="mfr. rating at 3,500 psi" value={TN} onChange={setTN} unit="kip" />
          <NumberField
            label="Rigging angle from vertical"
            hint="sling angle at governing point of rotation"
            value={slingAngle}
            onChange={setSlingAngle}
            unit="deg"
          />
        </div>

        <div className="panel">
          <h2>Dynamic factors</h2>
          <NumberField
            label="Concrete stress factor"
            hint="applied to static flexural stress"
            value={dfConcrete}
            onChange={setDfConcrete}
            unit="×"
            step="0.05"
          />
          <NumberField
            label="Hardware / insert factor"
            hint="applied to static anchor force"
            value={dfHardware}
            onChange={setDfHardware}
            unit="×"
            step="0.05"
          />
        </div>
      </div>

      <div>
        <div className="panel">
          <h2>Result summary</h2>
          <div className="summary-grid">
            <SummaryCard label="Amplified flexural stress" value={`${r.fTot.toFixed(1)} psi`} ok={r.stressOK} />
            <SummaryCard label="Required insert tension" value={`${r.requiredTension.toFixed(2)} kip`} ok={r.anchorOK} />
          </div>
        </div>

        <div className="panel">
          <h3>Flexural stress during rotation <span className="code-ref">PCI DH §8.3 / §8.4</span></h3>
          <ResultRow label="Static f_tot (from break-free-of-form geometry)" value={`${strip.fTot.toFixed(2)} psi`} />
          <ResultRow label="Dynamic factor" value={`× ${dfConcrete.toFixed(2)}`} />
          <ResultRow label="Amplified f_tot" value={`${r.fTot.toFixed(2)} psi`} emph />
          <ResultRow label="Cracking stress, f'cr" value={`${r.fcr.toFixed(1)} psi`} />
          <div className="result-row">
            <span className="label">DCR = f_tot / f'cr</span>
            <span className="value">
              {r.stressDCR.toFixed(2)} &nbsp;<Verdict ok={r.stressOK} />
            </span>
          </div>
          <DcrBar dcr={r.stressDCR} />

          <h3>Insert capacity at rigging angle</h3>
          <ResultRow label="Static load per insert, wp/N" value={`${(strip.wp / N).toFixed(2)} kip`} />
          <ResultRow label="× hardware dynamic factor" value={`${((strip.wp / N) * dfHardware).toFixed(2)} kip`} />
          <ResultRow label="÷ cos(rigging angle)" value={`${r.requiredTension.toFixed(2)} kip`} emph />
          <ResultRow label="TNR = TN·√(f'c/3500)" value={`${r.TNR.toFixed(2)} kip`} />
          <div className="result-row">
            <span className="label">DCR = required tension / TNR</span>
            <span className="value">
              {r.anchorDCR.toFixed(2)} &nbsp;<Verdict ok={r.anchorOK} />
            </span>
          </div>
          <DcrBar dcr={r.anchorDCR} />

          <div className="note warn">
            This module models the tilt from horizontal as governed by the
            same break-free-from-form flexural geometry as the stripping
            check (the perpendicular self-weight component is largest near
            θ = 0), scaled by a dynamic/impact factor, plus an insert check
            at the actual rigging angle from vertical. The 1.2× / 1.5×
            defaults are commonly used industry values for concrete stress
            and hardware design, respectively, but PCI leaves the specific
            dynamic factor to the engineer or lifting-hardware manufacturer.
            Confirm against your rigging plan, crane geometry, and the full
            PCI Design Handbook §8.4 discussion before finalizing.
          </div>
        </div>
      </div>
    </div>
  )
}
