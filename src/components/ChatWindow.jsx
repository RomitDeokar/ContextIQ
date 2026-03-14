import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, RotateCcw, Shield, MessageSquare } from 'lucide-react'
import MessageBubble from './MessageBubble'
import ClarificationCard from './ClarificationCard'
import ConfidenceGuard from './ConfidenceGuard'
import AmbiguityHeatmap from './AmbiguityHeatmap'
import ProcessingSteps from './ProcessingSteps'
import { useAmbiguity } from '../hooks/useAmbiguity'

export default function ChatWindow({
  messages,
  isLoading,
  pendingClarification,
  sessionMemory,
  department,
  onSend,
  onResolve,
  onClear,
  currentTrace
}) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const { liveScore, analyzeLive } = useAmbiguity()
  const [lastTraceId, setLastTraceId] = useState(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingClarification, isLoading])

  // Track which trace is "current" so we only show processing steps for the latest query
  useEffect(() => {
    if (currentTrace) {
      setLastTraceId(Date.now())
    }
  }, [currentTrace])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSend(input.trim())
    setInput('')
    analyzeLive('', department, sessionMemory)
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setInput(val)
    analyzeLive(val, department, sessionMemory)
  }

  const suggestions = [
    'Show apple performance',
    'Freeze the release pipeline',
    'Raise a ticket for the branch delta',
    'Book the plant cycle report',
  ]

  // Find the last user message index for showing processing steps
  const lastUserMsgIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return i
    }
    return -1
  })()

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="mb-6">
              <div className="relative mx-auto w-14 h-14 mb-4">
                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-900/15">
                  <Shield size={24} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse-soft" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1.5 tracking-tight">
                What would you like to look up?
              </h2>
              <p className="text-[13px] text-gray-400 max-w-sm leading-relaxed">
                Type any enterprise query. The semantic firewall will analyze it for ambiguity
                before generating a response.
              </p>
            </div>

            {/* Inline hint about how it works */}
            <div className="flex items-center gap-6 text-[10px] text-gray-400 mb-6">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Score &lt; 40 = passes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>40-60 = warning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span>&gt; 60 = AI blocked</span>
              </div>
            </div>

            {/* Subtle suggestion chips */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(s)
                    analyzeLive(s, department, sessionMemory)
                    inputRef.current?.focus()
                  }}
                  className="text-[11px] text-gray-400 px-3 py-1.5 rounded-lg border border-gray-200
                    bg-white hover:bg-gray-50 hover:text-gray-600 hover:border-gray-300
                    transition-all cursor-pointer"
                >
                  <span className="text-gray-300 mr-1">
                    <MessageSquare size={10} className="inline -mt-px" />
                  </span>
                  {s}
                </button>
              ))}
            </div>

            {/* Subtle tip */}
            <p className="text-[10px] text-gray-300 mt-6">
              Tip: Select a department above to see how context changes meaning
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          if (msg.role === 'system' && msg.type === 'clarification') {
            return (
              <div key={msg.id} className="space-y-3 animate-fade-in-up">
                <ConfidenceGuard scoreResult={msg.scoreResult} />
                <ClarificationCard
                  term={msg.term}
                  meanings={msg.meanings}
                  scoreResult={msg.scoreResult}
                  onResolve={onResolve}
                />
                {msg.scoreResult?.wordAnalysis && (
                  <div className="px-2">
                    <AmbiguityHeatmap wordAnalysis={msg.scoreResult.wordAnalysis} />
                  </div>
                )}
              </div>
            )
          }
          return (
            <div key={msg.id}>
              <MessageBubble message={msg} />
              {/* Show processing steps only after the LATEST user message */}
              {msg.role === 'user' && idx === lastUserMsgIdx && currentTrace && (
                <ProcessingSteps scoreResult={currentTrace} isActive={isLoading} />
              )}
            </div>
          )
        })}

        {isLoading && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <Loader2 size={14} className="animate-spin text-gray-400" />
              <span className="text-xs text-gray-500">Generating response...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Live Ambiguity Preview */}
      {liveScore && input.trim().length > 1 && (
        <div className="flex-shrink-0 px-5 py-2 border-t border-gray-100 bg-white/90 backdrop-blur-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-colors ${
                liveScore.score > 60 ? 'bg-red-500 animate-pulse'
                : liveScore.score > 40 ? 'bg-amber-400'
                : 'bg-emerald-400'
              }`} />
              <span className={`text-xs font-bold tabular-nums ${
                liveScore.score > 60 ? 'text-red-500' : liveScore.score > 40 ? 'text-amber-500' : 'text-emerald-500'
              }`}>{liveScore.score}</span>
            </div>

            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden max-w-24">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  liveScore.score > 60 ? 'bg-red-400' : liveScore.score > 40 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${liveScore.score}%` }}
              />
            </div>

            {liveScore.detectedTerms.length > 0 && (
              <div className="flex items-center gap-1 overflow-hidden">
                {liveScore.detectedTerms.slice(0, 3).map((t, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono truncate max-w-[80px]">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {liveScore.language?.isMixed && (
              <span className="text-[9px] px-2 py-0.5 bg-purple-50 text-purple-500 rounded-full font-medium border border-purple-100 flex-shrink-0">
                {liveScore.language.label}
              </span>
            )}

            <span className={`text-[10px] font-semibold flex-shrink-0 ${
              liveScore.needsClarification ? 'text-red-500' : liveScore.score > 40 ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {liveScore.needsClarification ? 'WILL BLOCK' : liveScore.score > 40 ? 'WARNING' : 'CLEAR'}
            </span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 px-5 py-3 border-t border-gray-100 bg-white">
        <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={
                pendingClarification
                  ? "Select a meaning above to continue..."
                  : department
                  ? `Query as ${department}...`
                  : "Type an enterprise query..."
              }
              disabled={isLoading || !!pendingClarification}
              className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                focus:outline-none focus:border-gray-400 focus:bg-white focus:shadow-sm
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all placeholder:text-gray-300"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !!pendingClarification}
            className="w-11 h-11 flex items-center justify-center rounded-xl
              bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20
              disabled:opacity-20 disabled:cursor-not-allowed
              transition-all cursor-pointer flex-shrink-0 active:scale-95"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="w-11 h-11 flex items-center justify-center rounded-xl
                border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50
                transition-all cursor-pointer flex-shrink-0"
              title="Reset session"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
