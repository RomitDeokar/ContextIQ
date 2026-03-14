import { useEffect, useState, useRef } from 'react'
import { Globe, BookOpen, Brain, Shield, Zap, Check, Loader2 } from 'lucide-react'

const STEPS = [
  { icon: Globe, label: 'Detecting language', doneLabel: 'Language detected' },
  { icon: BookOpen, label: 'Matching enterprise glossary', doneLabel: 'Glossary matched' },
  { icon: Brain, label: 'Scoring ambiguity', doneLabel: 'Ambiguity scored' },
  { icon: Shield, label: 'Evaluating confidence', doneLabel: 'Confidence evaluated' },
  { icon: Zap, label: 'Determining action', doneLabel: 'Action resolved' },
]

export default function ProcessingSteps({ scoreResult, isActive }) {
  const [visibleStep, setVisibleStep] = useState(isActive ? 0 : 5)
  const timersRef = useRef([])

  useEffect(() => {
    // Clear any existing timers
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    if (!isActive) {
      setVisibleStep(5)
      return
    }

    setVisibleStep(0)
    const newTimers = STEPS.map((_, i) =>
      setTimeout(() => setVisibleStep(i + 1), (i + 1) * 280)
    )
    timersRef.current = newTimers

    return () => newTimers.forEach(clearTimeout)
  }, [isActive])

  if (!scoreResult) return null

  const details = [
    scoreResult.language?.label || 'English',
    `${scoreResult.detectedTerms.length} terms found`,
    `Score: ${scoreResult.score}/100`,
    scoreResult.score > 60 ? 'High risk' : scoreResult.score > 40 ? 'Moderate' : 'Low risk',
    scoreResult.action,
  ]

  return (
    <div className="mx-auto max-w-md py-2 animate-fade-in">
      <div className="space-y-0">
        {STEPS.map((step, i) => {
          const done = visibleStep > i
          const active = visibleStep === i
          const Icon = step.icon
          return (
            <div
              key={i}
              className={`flex items-center gap-2.5 py-1 transition-all duration-300 ${
                done ? 'opacity-100' : active ? 'opacity-80' : 'opacity-0 h-0 py-0 overflow-hidden'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                done
                  ? 'bg-emerald-50 text-emerald-500'
                  : 'bg-gray-100 text-gray-300'
              }`}>
                {done ? <Check size={10} strokeWidth={3} /> : <Loader2 size={10} className="animate-spin" />}
              </div>
              <span className={`text-[11px] transition-colors duration-300 ${done ? 'text-gray-500' : 'text-gray-400'}`}>
                {done ? step.doneLabel : step.label}
              </span>
              {done && (
                <span className="text-[9px] text-gray-400 font-medium ml-auto flex-shrink-0">
                  {details[i]}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
