import { Search, Globe, Building2, Brain, Zap, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function SemanticResolutionTrace({ trace, department }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    if (!trace) { setAnimatedScore(0); return }
    const target = trace.score
    const duration = 600
    const start = animatedScore
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(start + (target - start) * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [trace?.score])

  if (!trace) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
        <div className="w-10 h-10 mx-auto rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-2">
          <Search size={16} className="text-gray-300" />
        </div>
        <p className="text-[11px] text-gray-400 font-medium">No query analyzed yet</p>
        <p className="text-[10px] text-gray-300 mt-0.5">Send a query or run a scenario</p>
      </div>
    )
  }

  const confidence = 100 - trace.score
  const rows = [
    {
      icon: Search, label: 'Terms',
      value: trace.detectedTerms.length > 0 ? trace.detectedTerms.join(', ') : 'none',
      active: trace.detectedTerms.length > 0
    },
    {
      icon: Zap, label: 'Meanings',
      value: trace.termDetails?.reduce((sum, t) => sum + t.meanings.length, 0) || 0,
      active: true
    },
    {
      icon: Building2, label: 'Dept',
      value: department || 'not set',
      active: !!department
    },
    {
      icon: Globe, label: 'Lang',
      value: trace.language?.label || 'English',
      active: trace.language?.isMixed,
      badge: trace.language?.isMixed ? 'MIXED' : null,
      badgeColor: 'bg-purple-100 text-purple-600'
    },
    {
      icon: trace.needsClarification ? TrendingUp : TrendingDown,
      label: 'Action',
      value: trace.action,
      active: true,
      badge: trace.needsClarification ? 'BLOCKED' : 'PASSED',
      badgeColor: trace.needsClarification ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
    },
  ]

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-3 py-2.5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
          Resolution Trace
        </p>
        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
          trace.needsClarification ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
        }`}>
          {trace.needsClarification ? 'GUARD ACTIVE' : 'RESOLVED'}
        </span>
      </div>

      {/* Score Ring */}
      <div className="px-3 py-3 flex items-center gap-3 border-b border-gray-50">
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" stroke="#f3f4f6" strokeWidth="3.5" fill="none" />
            <circle
              cx="24" cy="24" r="20"
              stroke={trace.score > 60 ? '#ef4444' : trace.score > 40 ? '#f59e0b' : '#10b981'}
              strokeWidth="3.5" fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(animatedScore / 100) * 125.66} 125.66`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-black tabular-nums ${
              trace.score > 60 ? 'text-red-500' : trace.score > 40 ? 'text-amber-500' : 'text-emerald-500'
            }`}>{animatedScore}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-gray-400 font-medium">Ambiguity Score</p>
          <p className={`text-[11px] font-bold truncate ${
            trace.score > 60 ? 'text-red-500' : trace.score > 40 ? 'text-amber-500' : 'text-emerald-500'
          }`}>
            {trace.score > 60 ? 'High Risk — AI Blocked' : trace.score > 40 ? 'Moderate — Warning' : 'Low — Resolved'}
          </p>
          <p className="text-[9px] text-gray-300 mt-0.5">
            Confidence: {confidence}%
          </p>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5">
            <row.icon size={10} className={`flex-shrink-0 ${row.active ? 'text-gray-500' : 'text-gray-300'}`} />
            <span className="text-[10px] text-gray-400 w-14 flex-shrink-0 font-medium">{row.label}</span>
            <span className={`text-[10px] flex-1 truncate min-w-0 ${row.active ? 'text-gray-700 font-semibold' : 'text-gray-400'}`}>
              {String(row.value)}
            </span>
            {row.badge && (
              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${row.badgeColor}`}>
                {row.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Score Zones */}
      <div className="px-3 py-2.5 bg-gray-50/80 border-t border-gray-100">
        <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden">
          <div className="flex-[40] bg-emerald-200 relative rounded-l-full">
            {trace.score <= 40 && (
              <div className="absolute inset-0 bg-emerald-400 animate-pulse-soft rounded-l-full" />
            )}
          </div>
          <div className="flex-[20] bg-amber-200 relative">
            {trace.score > 40 && trace.score <= 60 && (
              <div className="absolute inset-0 bg-amber-400 animate-pulse-soft" />
            )}
          </div>
          <div className="flex-[40] bg-red-200 relative rounded-r-full">
            {trace.score > 60 && (
              <div className="absolute inset-0 bg-red-400 animate-pulse-soft rounded-r-full" />
            )}
          </div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[7px] text-emerald-500 font-bold">PASS 0-40</span>
          <span className="text-[7px] text-amber-500 font-bold">WARN 41-60</span>
          <span className="text-[7px] text-red-500 font-bold">BLOCK 61-100</span>
        </div>
      </div>
    </div>
  )
}
