import { AlertTriangle, ArrowRight, ShieldX, Globe } from 'lucide-react'

export default function ClarificationCard({ term, meanings, scoreResult, onResolve }) {
  return (
    <div className="mx-auto max-w-lg animate-scale-in">
      <div className="bg-white border border-amber-200/80 rounded-2xl overflow-hidden shadow-lg shadow-amber-100/30">
        {/* Top gradient bar */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />

        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center border border-amber-200/50">
              <AlertTriangle size={18} className="text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900">Semantic Ambiguity Detected</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">
                  Ambiguity Score: {scoreResult?.score || '—'}
                </span>
                <div className="w-12 h-1 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${scoreResult?.score || 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            The term <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">"{term}"</span> has{' '}
            <span className="font-bold text-gray-800">{meanings.length}</span> conflicting enterprise meanings.
            <br />
            <span className="text-gray-400">AI is <span className="font-semibold text-red-500">blocked</span> until you select the correct context:</span>
          </p>

          <div className="space-y-1.5">
            {meanings.map((m, i) => (
              <button
                key={i}
                onClick={() => onResolve(term, m)}
                className="w-full text-left group flex items-center gap-3 px-4 py-3 rounded-xl
                  border border-gray-100 bg-gray-50/50
                  hover:bg-gray-900 hover:text-white hover:border-gray-900
                  hover:shadow-lg hover:shadow-gray-900/10 hover:-translate-y-px
                  transition-all duration-200 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 group-hover:bg-white/10 group-hover:border-white/20 flex items-center justify-center flex-shrink-0 transition-all">
                  <span className="text-[10px] font-bold text-gray-400 group-hover:text-white">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-300 block">
                    {m.dept}
                  </span>
                  <p className="text-sm text-gray-700 group-hover:text-white truncate">{m.meaning}</p>
                </div>
                <ArrowRight size={14} className="text-gray-200 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>

          {scoreResult?.language?.isMixed && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-xl border border-purple-100">
              <Globe size={12} className="text-purple-500" />
              <p className="text-[10px] text-purple-600 font-semibold">
                Mixed language detected: <span className="text-purple-800">{scoreResult.language.label}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
