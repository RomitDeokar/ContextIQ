import { useState } from 'react'
import { FlaskConical, ChevronDown, ChevronUp, Play } from 'lucide-react'

const SCENARIOS = [
  {
    id: 1,
    label: 'Show apple performance',
    dept: 'F&B',
    tag: 'Dept resolves ambiguity',
    what: '4 meanings narrowed to 1',
  },
  {
    id: 2,
    label: 'Apple ka report dikhao',
    dept: null,
    tag: 'Hinglish + AI blocked',
    what: 'Mixed language, score > 60',
  },
  {
    id: 3,
    label: 'Falcon shipment delayed',
    dept: 'Manufacturing',
    tag: 'Clean pass',
    what: 'Single meaning, low score',
  },
  {
    id: 4,
    label: 'Book the issue',
    dept: 'IT Helpdesk',
    tag: 'Session memory',
    what: 'Send twice to see -10 drop',
  },
]

export default function ScenarioPanel({ onRun }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <FlaskConical size={10} className="text-violet-500 flex-shrink-0" />
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
          Try Scenarios
        </p>
        <span className="text-[8px] text-gray-300 ml-1">({SCENARIOS.length})</span>
        <span className="ml-auto">
          {open
            ? <ChevronUp size={11} className="text-gray-400" />
            : <ChevronDown size={11} className="text-gray-400" />
          }
        </span>
      </button>
      {open && (
        <div className="p-2 space-y-0.5">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => onRun(s)}
              className="w-full text-left group flex items-center gap-2 px-2.5 py-2 rounded-xl
                hover:bg-gray-50 transition-all cursor-pointer"
            >
              <div className="w-5 h-5 rounded-md bg-gray-100 group-hover:bg-gray-900 flex items-center justify-center flex-shrink-0 transition-all">
                <Play size={8} className="text-gray-400 group-hover:text-white transition-colors ml-px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                  {s.label}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-[7px] font-bold px-1 py-0.5 rounded ${
                    s.dept ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-400'
                  }`}>
                    {s.dept || 'No dept'}
                  </span>
                  <span className="text-[8px] text-gray-400 truncate">{s.tag}</span>
                </div>
              </div>
            </button>
          ))}
          <p className="text-[7px] text-gray-300 text-center pt-1 pb-0.5">
            Auto-sets department and sends query
          </p>
        </div>
      )}
    </div>
  )
}
