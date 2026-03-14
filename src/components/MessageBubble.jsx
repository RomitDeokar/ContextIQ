import { Bot, User, Shield, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import AmbiguityHeatmap from './AmbiguityHeatmap'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const isAssistant = message.role === 'assistant'
  const [showTrace, setShowTrace] = useState(false)

  if (isSystem) return null

  return (
    <div className={`flex gap-3 animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100 flex items-center justify-center mt-0.5">
          <Bot size={15} className="text-gray-400" />
        </div>
      )}
      <div className={`max-w-[78%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`
            px-4 py-3 text-sm leading-relaxed
            ${isUser
              ? 'bg-gray-900 text-white rounded-2xl rounded-br-md shadow-md shadow-gray-900/10'
              : 'bg-white text-gray-700 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm'
            }
            ${message.type === 'resolution'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl rounded-bl-md shadow-sm shadow-emerald-100/50'
              : ''
            }
          `}
        >
          {message.type === 'resolution' && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <Shield size={11} className="text-emerald-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">Context Resolved</span>
            </div>
          )}
          <div className="whitespace-pre-wrap">{message.text}</div>
        </div>

        {/* Score Badge + Resolved Terms */}
        {isAssistant && (
          <div className="flex items-center gap-1.5 mt-1.5 ml-1 flex-wrap">
            {message.scoreResult && (
              <button
                onClick={() => setShowTrace(!showTrace)}
                className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-semibold cursor-pointer transition-all
                  ${message.scoreResult.score > 60
                    ? 'bg-red-50 text-red-500 border border-red-100 hover:bg-red-100'
                    : message.scoreResult.score > 40
                    ? 'bg-amber-50 text-amber-500 border border-amber-100 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-500 border border-emerald-100 hover:bg-emerald-100'
                  }`}
              >
                Score: {message.scoreResult.score}
                {showTrace ? <ChevronUp size={8} /> : <ChevronDown size={8} />}
              </button>
            )}
            {message.resolvedTerms?.map((rt, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5
                  bg-blue-50 text-blue-500 rounded-full border border-blue-100 font-medium"
              >
                <Zap size={7} />
                {rt.term} → {rt.dept}
              </span>
            ))}
          </div>
        )}

        {/* Expandable Trace */}
        {showTrace && message.scoreResult?.wordAnalysis && (
          <div className="mt-2 ml-1 animate-fade-in">
            <AmbiguityHeatmap wordAnalysis={message.scoreResult.wordAnalysis} />
          </div>
        )}

        <span className="text-[9px] text-gray-300 mt-1 ml-1 block">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center mt-0.5 shadow-md shadow-gray-900/10">
          <User size={15} className="text-white" />
        </div>
      )}
    </div>
  )
}
