import { Clock, TrendingDown, TrendingUp } from 'lucide-react'

export default function RecentDecisions({ decisions }) {
  if (!decisions || decisions.length === 0) return null

  // Calculate score delta between consecutive decisions
  const withDelta = decisions.map((d, i) => {
    if (i === 0) return { ...d, delta: null }
    const prev = decisions[i - 1]
    return { ...d, delta: d.score - prev.score }
  })

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-3 py-2.5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center gap-2">
        <Clock size={10} className="text-gray-400 flex-shrink-0" />
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
          Decision Log
        </p>
        <span className="ml-auto text-[9px] font-bold text-gray-300 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
          {decisions.length}
        </span>
      </div>
      <div className="divide-y divide-gray-50 max-h-[220px] overflow-y-auto">
        {withDelta.slice(-6).reverse().map((d, i) => (
          <div key={i} className={`px-3 py-2 flex items-center gap-2.5 ${i === 0 ? 'bg-gray-50/50' : ''} animate-fade-in`}>
            {/* Status dot */}
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              d.action === 'clarification required' ? 'bg-red-400'
              : d.action === 'gemini with warning' ? 'bg-amber-400'
              : 'bg-emerald-400'
            }`} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-semibold text-gray-700 truncate">
                  {d.term || '\u2014'}
                </span>
                <span className="text-[7px] px-1 py-0.5 bg-gray-100 text-gray-500 rounded font-semibold flex-shrink-0">
                  {d.dept}
                </span>
                {d.language !== 'English' && (
                  <span className="text-[7px] px-1 py-0.5 bg-purple-50 text-purple-500 rounded font-semibold flex-shrink-0">
                    {d.language}
                  </span>
                )}
              </div>
              <span className="text-[8px] text-gray-400 truncate block">{d.action}</span>
            </div>

            {/* Score + Delta */}
            <div className="text-right flex-shrink-0">
              <span className={`text-xs font-black tabular-nums ${
                d.score > 60 ? 'text-red-500' : d.score > 40 ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                {d.score}
              </span>
              {d.delta !== null && d.delta !== 0 && (
                <div className={`flex items-center justify-end gap-0.5 ${
                  d.delta < 0 ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {d.delta < 0 ? <TrendingDown size={7} /> : <TrendingUp size={7} />}
                  <span className="text-[8px] font-bold">{d.delta > 0 ? '+' : ''}{d.delta}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
