import { useMemo, useState } from 'react'
import { NumberField, SegmentedField } from '../components/Field'
import { ResultRow, Verdict, DcrBar, SummaryCard } from '../components/Results'
import PanelDiagram from '../components/PanelDiagram'
import { stripAnalysis } from '../lib/pciFormulas'

export default function Stripping() {
  const [a, setA] = useState(13.25)
  const [b, setB] = useState(13.84)
  const [t, setT] = useState(8)
  const [rt, setRt] = useState(0.75)
  const [gamma, setGamma] = useState(150)
  const [fc, setFc] = useState(2500)
  const [N, setN] = useState(4)
  const [TN, setTN] = useState(4.6)

  const r = useMemo(
    () => stripAnalysis({ a, b, t, rt, gamma, fc, N, TN }),
    [a, b, t, rt, gamma, fc, N, TN]
  )

  return (
    <div className="module-grid">
      <div>
        <div className="panel">
          <h2>Panel geometry</h2>
          <NumberField label="Long dimension, a" value={a} onChange={setA} unit="ft" />
          <NumberField label="Short dimension, b" value={b} onChange={setB} unit="ft" />
          <NumberField label="Thickness, t" value={t} onChange={setT} unit="in" />
          <NumberField label="Reveal / blockout depth" hint="reduces effective depth" value={rt} onChange={setRt} unit="in" />
          <NumberField label="Unit weight, γ" value={gamma} onChange={setGamma} unit="pcf" />
        </div>

        <div className="panel">
          <h2>Handling parameters</h2>
          <NumberField label="Concrete strength at strip" value={fc} onChange={setFc} unit="psi" />
          <SegmentedField
            label="Pickup points, N"
            value={N}
            onChange={(v) => setN(parseInt(v))}
            options={[
              { value: 4, label: '4-pt' },
              { value: 8, label: '8-pt' },
            ]}
          />
          <NumberField
            label="Rated lifter capacity"
            hint="mfr. rating at 3,500 psi"
            value={TN}
            onChange={setTN}
            unit="kip"
          />
        </div>
      </div>

      <div>
        <div className="panel">
          <h2>Result summary</h2>
          <div className="summary-grid">
            <SummaryCard label="Total flexural stress" value={`${r.fTot.toFixed(1)} psi`} ok={r.stressOK} />
            <SummaryCard label="Load per anchor" value={`${r.anchorLoad.toFixed(2)} kip`} ok={r.anchorOK} />
          </div>
        </div>

        <div className="panel">
          <PanelDiagram a={a} b={b} N={N} />
        </div>

        <div className="panel">
          <h3>Weight &amp; moments</h3>
          <ResultRow label="Self-weight pressure, w" value={`${r.w.toFixed(1)} psf`} />
          <ResultRow label="Panel weight, wp" value={`${r.wp.toFixed(2)} kip`} />
          <ResultRow label="Mx" value={`${r.Mx.toFixed(2)} kip·ft`} />
          <ResultRow label="My" value={`${r.My.toFixed(2)} kip·ft`} />

          <h3>Flexural stress check <span className="code-ref">PCI DH §8.3</span></h3>
          <ResultRow label="fx" value={`${r.fx.toFixed(2)} psi`} />
          <ResultRow label="fy" value={`${r.fy.toFixed(2)} psi`} />
          <ResultRow label="f_tot = fx + fy" value={`${r.fTot.toFixed(2)} psi`} emph />
          <ResultRow label="Cracking stress, f'cr = 5√f'c" value={`${r.fcr.toFixed(1)} psi`} />
          <div className="result-row">
            <span className="label">DCR = f_tot / f'cr</span>
            <span className="value">
              {r.stressDCR.toFixed(2)} &nbsp;<Verdict ok={r.stressOK} />
            </span>
          </div>
          <DcrBar dcr={r.stressDCR} />

          <h3>Anchor / lifter check</h3>
          <ResultRow label="TNR = TN·√(f'c/3500)" value={`${r.TNR.toFixed(2)} kip`} />
          <ResultRow label="Load per anchor, wp/N" value={`${r.anchorLoad.toFixed(2)} kip`} />
          <div className="result-row">
            <span className="label">DCR = load / TNR</span>
            <span className="value">
              {r.anchorDCR.toFixed(2)} &nbsp;<Verdict ok={r.anchorOK} />
            </span>
          </div>
          <DcrBar dcr={r.anchorDCR} />

          <div className="note">
            Moment coefficients (0.0107/0.0214 for 4-point, 0.0054/0.00054 for
            8-point) and lift-point inset fractions are the PCI Design
            Handbook 8th ed. §8.3 equal-load pickup values for a flat
            rectangular panel with edges free to rotate. Verify against the
            full handbook table for panels with unusual aspect ratios,
            openings, or non-uniform pickup.
          </div>
        </div>
      </div>
    </div>
  )
}
