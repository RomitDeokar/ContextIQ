export default function AmbiguityHeatmap({ wordAnalysis }) {
  if (!wordAnalysis || wordAnalysis.length === 0) return null

  return (
    <div className="animate-fade-in">
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        Token Ambiguity Map
      </p>
      <div className="flex flex-wrap gap-1.5">
        {wordAnalysis.map((w, i) => {
          if (w.status === 'skip') return null

          let bg, text, border, glow
          switch (w.status) {
            case 'ambiguous':
              bg = 'bg-red-50'; text = 'text-red-600'; border = 'border-red-200'; glow = 'shadow-red-100'
              break
            case 'known':
              bg = 'bg-emerald-50'; text = 'text-emerald-600'; border = 'border-emerald-200'; glow = 'shadow-emerald-100'
              break
            case 'fuzzy':
              bg = 'bg-amber-50'; text = 'text-amber-600'; border = 'border-amber-200'; glow = 'shadow-amber-100'
              break
            case 'unknown':
              bg = 'bg-gray-100'; text = 'text-gray-500'; border = 'border-gray-200'; glow = ''
              break
            default:
              bg = 'bg-gray-50'; text = 'text-gray-400'; border = 'border-gray-100'; glow = ''
          }

          return (
            <div
              key={i}
              className={`
                group relative inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                text-[11px] font-mono border ${bg} ${text} ${border}
                shadow-sm ${glow} transition-all duration-150 hover:shadow-md
              `}
            >
              <span className="font-semibold">{w.word}</span>
              {w.meaningCount > 1 && (
                <span className="text-[8px] font-bold opacity-60 bg-white/50 px-1 rounded">{w.meaningCount}x</span>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5
                bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100
                transition-all pointer-events-none whitespace-nowrap z-20 shadow-xl font-sans">
                {w.status === 'ambiguous' && `${w.meaningCount} meanings — ambiguous`}
                {w.status === 'known' && `Single meaning — resolved`}
                {w.status === 'fuzzy' && `Similar to: "${w.fuzzyMatch}"`}
                {w.status === 'unknown' && `Unknown enterprise term`}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                  <div className="w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2.5">
        {[
          { color: 'bg-red-400', label: 'Ambiguous' },
          { color: 'bg-amber-400', label: 'Fuzzy match' },
          { color: 'bg-emerald-400', label: 'Resolved' },
          { color: 'bg-gray-300', label: 'Unknown' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${l.color}`} />
            <span className="text-[9px] text-gray-400 font-medium">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
