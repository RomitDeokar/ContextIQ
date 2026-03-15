import { useState, createElement } from 'react'
import { Shield, Zap, Globe, BookOpen, PanelRightOpen, PanelRightClose, Activity } from 'lucide-react'
import DepartmentSelector from './components/DepartmentSelector'
import ChatWindow from './components/ChatWindow'
import SemanticResolutionTrace from './components/SemanticResolutionTrace'
import RecentDecisions from './components/RecentDecisions'
import VocabExpansionLayer from './components/VocabExpansionLayer'
import ScenarioPanel from './components/ScenarioPanel'
import { useChat } from './hooks/useChat'

export default function App() {
  const [department, setDepartment] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const {
    messages,
    isLoading,
    decisions,
    currentTrace,
    pendingClarification,
    sessionMemory,
    processQuery,
    resolveClarification,
    clearChat
  } = useChat()

  const handleSend = (query) => {
    processQuery(query, department)
  }

  const handleResolve = (term, meaning) => {
    resolveClarification(term, meaning, department)
  }

  const handleScenario = (scenario) => {
    if (scenario.dept) {
      setDepartment(scenario.dept)
    } else {
      setDepartment(null)
    }
    setTimeout(() => {
      processQuery(scenario.label, scenario.dept)
    }, 100)
  }

  const unknownTerms = currentTrace?.wordAnalysis
    ?.filter(w => w.status === 'unknown')
    ?.map(w => w.word) || []

  return (
    <div className="h-screen w-screen bg-[#fafafa] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200/60">
        <div className="max-w-[1440px] mx-auto px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center shadow-lg shadow-gray-900/20">
                <Shield size={17} className="text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse-soft" />
            </div>
            <div>
              <h1 className="text-[15px] font-extrabold text-gray-900 tracking-tight leading-none">
                ContextIQ
              </h1>
              <p className="text-[9px] text-gray-400 tracking-widest uppercase font-semibold">
                Enterprise Semantic Firewall
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 mr-3">
              <StatusPill icon={Zap} label="Firewall Active" color="text-emerald-500" />
              <div className="w-px h-3 bg-gray-200" />
              <StatusPill icon={Globe} label="Multilingual" color="text-purple-500" />
              <div className="w-px h-3 bg-gray-200" />
              <StatusPill icon={BookOpen} label="20 Terms" color="text-blue-500" />
              {decisions.length > 0 && (
                <>
                  <div className="w-px h-3 bg-gray-200" />
                  <StatusPill icon={Activity} label={`${decisions.length} Queries`} color="text-amber-500" />
                </>
              )}
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center
                text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
              title={sidebarOpen ? 'Hide panel' : 'Show panel'}
            >
              {sidebarOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
            </button>
          </div>
        </div>
      </header>

      {/* Department Selector */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-5 py-2">
          <DepartmentSelector selected={department} onSelect={setDepartment} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden max-w-[1440px] mx-auto w-full">
        {/* Chat Panel */}
        <div className={`flex-1 flex flex-col min-w-0 bg-white border-x border-gray-100 transition-all duration-300`}>
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            pendingClarification={pendingClarification}
            sessionMemory={sessionMemory}
            department={department}
            onSend={handleSend}
            onResolve={handleResolve}
            onClear={clearChat}
            currentTrace={currentTrace}
          />
        </div>

        {/* Right Sidebar */}
        {sidebarOpen && (
          <aside className="hidden lg:block w-[320px] flex-shrink-0 animate-slide-in-right">
            <div className="h-full overflow-y-auto overflow-x-hidden px-3 py-3 bg-[#fafafa]">
              <div className="space-y-3">
                {/* Session Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <StatCard
                    label="Dept"
                    value={department ? department.split(' ')[0] : '—'}
                    active={!!department}
                  />
                  <StatCard
                    label="Resolved"
                    value={Object.keys(sessionMemory).length}
                    active={Object.keys(sessionMemory).length > 0}
                  />
                  <StatCard
                    label="Queries"
                    value={decisions.length}
                    active={decisions.length > 0}
                  />
                </div>

                {/* Resolution Trace */}
                <SemanticResolutionTrace trace={currentTrace} department={department} />

                {/* Recent Decisions */}
                <RecentDecisions decisions={decisions} />

                {/* Try Scenarios */}
                <ScenarioPanel onRun={handleScenario} />

                {/* Vocab Expansion */}
                <VocabExpansionLayer unknownTerms={unknownTerms} />

                {/* Architecture */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    How the Firewall Works
                  </p>
                  <div className="space-y-1">
                    {[
                      { step: 'Query enters semantic firewall', color: 'bg-gray-400' },
                      { step: 'Language detection (Hindi / English / Hinglish)', color: 'bg-purple-400' },
                      { step: 'Enterprise glossary matching + fuzzy search', color: 'bg-blue-400' },
                      { step: 'Weighted ambiguity scoring (0\u2013100)', color: 'bg-amber-400' },
                      { step: 'Score > 60 \u2192 AI blocked, must clarify', color: 'bg-red-400' },
                      { step: 'Score < 40 \u2192 Resolved, AI responds safely', color: 'bg-emerald-400' },
                      { step: 'Every decision logged and auditable', color: 'bg-gray-400' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="flex flex-col items-center mt-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                          {i < 6 && <div className="w-px h-3 bg-gray-200 mt-0.5" />}
                        </div>
                        <span className="text-[10px] text-gray-500 leading-tight">{item.step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 bg-white border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-5 py-1.5 flex items-center justify-between">
          <p className="text-[9px] text-gray-300 font-medium">
            ContextIQ v1.0 — Hack & Forge 2026 — Data Science Summit, BIT Mesra
          </p>
          <div className="flex items-center gap-2 text-[9px] text-gray-300">
            <span className="px-1.5 py-0.5 bg-gray-50 rounded font-mono">React</span>
            <span className="px-1.5 py-0.5 bg-gray-50 rounded font-mono">Tailwind</span>
            <span className="px-1.5 py-0.5 bg-gray-50 rounded font-mono">Gemini</span>
            <span className="px-1.5 py-0.5 bg-gray-50 rounded font-mono">Fuse.js</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatusPill({ icon: Icon, label, color }) {
  return (
    <div className="flex items-center gap-1.5">
      {createElement(Icon, { size: 10, className: color })}
      <span className="text-[10px] text-gray-400 font-medium">{label}</span>
    </div>
  )
}

function StatCard({ label, value, active }) {
  return (
    <div className={`bg-white border rounded-xl p-2 text-center transition-all ${
      active ? 'border-gray-200 shadow-sm' : 'border-gray-100'
    }`}>
      <p className="text-[8px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-xs font-bold mt-0.5 truncate ${active ? 'text-gray-800' : 'text-gray-300'}`}>
        {value}
      </p>
    </div>
  )
}
