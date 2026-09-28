import { useState } from 'react'
import Stripping from './modules/Stripping'
import TiltUp from './modules/TiltUp'
import LiftingInsert from './modules/LiftingInsert'

const TABS = [
  { key: 'strip', label: 'Flat-Panel Stripping', component: Stripping },
  { key: 'tilt', label: 'Tilt-Up Erection', component: TiltUp },
  { key: 'insert', label: 'Lifting Insert', component: LiftingInsert },
]

export default function App() {
  const [active, setActive] = useState('strip')
  const [job, setJob] = useState('')
  const [jobNo, setJobNo] = useState('')
  const [by, setBy] = useState('')

  const ActiveComponent = TABS.find((t) => t.key === active).component

  return (
    <div className="app">
      <div className="titleblock">
        <div>
          <h1>Component Handling — PCI Chapter 8</h1>
          <p className="subtitle">Flat-panel stripping · tilt-up erection · lifting insert capacity</p>
        </div>
        <div className="fields">
          <div className="tb-field">
            <label>JOB</label>
            <input value={job} onChange={(e) => setJob(e.target.value)} />
          </div>
          <div className="tb-field">
            <label>JOB #</label>
            <input value={jobNo} onChange={(e) => setJobNo(e.target.value)} />
          </div>
          <div className="tb-field">
            <label>BY</label>
            <input value={by} onChange={(e) => setBy(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${active === t.key ? 'active' : ''}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ActiveComponent />

      <div className="footer-note">
        Calculations follow the flat-panel stripping methodology of the PCI
        Design Handbook: Precast and Prestressed Concrete, 8th ed., Chapter
        8 (Design for Handling and Erection), §8.3. Tilt-up and lifting
        insert modules extend that methodology with standard statics and
        commonly used dynamic/impact factors — engineering judgment and
        manufacturer hardware ratings govern for final signed calculations.
        This tool does not replace review by a licensed engineer.
      </div>
    </div>
  )
}
