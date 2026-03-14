import { ShieldAlert, XCircle, Lock } from 'lucide-react'

export default function ConfidenceGuard({ scoreResult }) {
  if (!scoreResult || scoreResult.score <= 60) return null

  const reasons = []
  const termCount = scoreResult.termDetails?.reduce((s, t) => s + t.meanings.length, 0) || 0
  if (termCount > 1) reasons.push(`${termCount} conflicting definitions found in glossary`)
  if (scoreResult.language?.isMixed) reasons.push(`Mixed language input: ${scoreResult.language.label}`)
  if (scoreResult.wordAnalysis?.some(w => w.status === 'unknown')) reasons.push('Contains unknown enterprise terms')
  if (!scoreResult.department) reasons.push('No department context selected')
  if (reasons.length === 0) reasons.push('Ambiguity score exceeds safety threshold')

  return (
    <div className="animate-bounce-in mx-auto max-w-lg">
      <div className="relative bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-2xl p-5 overflow-hidden">
        {/* Animated red glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full blur-3xl -mr-10 -mt-10" />

        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/30 animate-glow-red">
            <ShieldAlert size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-red-900">
                Confidence Guard Active
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500 text-white rounded-full shadow-sm">
                {scoreResult.score}/100
              </span>
            </div>
            <div className="flex items-center gap-1.5 mb-3">
              <Lock size={10} className="text-red-400" />
              <p className="text-[11px] text-red-600 font-medium">
                Gemini AI response is <span className="font-bold underline decoration-red-400">blocked</span> until context is resolved.
              </p>
            </div>
            <div className="space-y-1.5">
              {reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-red-600">
                  <XCircle size={12} className="flex-shrink-0 mt-px" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
