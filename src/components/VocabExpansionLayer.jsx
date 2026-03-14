import { useState } from 'react'
import { Save, BookPlus, Plus, Check, X } from 'lucide-react'
import { addToVocab, getAllDepartments } from '../utils/semanticFirewallEngine'

export default function VocabExpansionLayer({ unknownTerms, onSaved }) {
  const [expanded, setExpanded] = useState(false)
  const [newTerm, setNewTerm] = useState('')
  const [newDept, setNewDept] = useState('')
  const [newMeaning, setNewMeaning] = useState('')
  const [saved, setSaved] = useState([])

  const departments = getAllDepartments()

  const handleSave = () => {
    if (!newTerm || !newDept || !newMeaning) return
    addToVocab(newTerm, newDept, newMeaning)

    const stored = JSON.parse(localStorage.getItem('contextiq_custom_vocab') || '{}')
    if (!stored[newTerm.toLowerCase()]) stored[newTerm.toLowerCase()] = []
    stored[newTerm.toLowerCase()].push({ dept: newDept, meaning: newMeaning })
    localStorage.setItem('contextiq_custom_vocab', JSON.stringify(stored))

    setSaved(prev => [...prev, { term: newTerm, dept: newDept, meaning: newMeaning }])
    setNewTerm('')
    setNewDept('')
    setNewMeaning('')
    onSaved?.()
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-center gap-2 text-[10px] text-gray-400 hover:text-gray-600
          transition-all px-3 py-2 rounded-xl border border-dashed border-gray-200 hover:border-gray-300
          hover:bg-white cursor-pointer group"
      >
        <Plus size={11} className="group-hover:rotate-90 transition-transform" />
        <span className="font-medium">Expand Glossary</span>
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-fade-in">
      <div className="px-3 py-2.5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookPlus size={10} className="text-gray-400" />
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
            Vocab Expansion
          </p>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-50 cursor-pointer transition-colors"
        >
          <X size={10} />
        </button>
      </div>

      <div className="p-3 space-y-2">
        {unknownTerms?.length > 0 && (
          <div className="mb-1">
            <p className="text-[9px] text-gray-400 font-medium mb-1">Unknown terms:</p>
            <div className="flex flex-wrap gap-1">
              {unknownTerms.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setNewTerm(t)}
                  className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-100
                    hover:bg-amber-100 transition-colors cursor-pointer font-medium"
                >
                  + {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <input
          type="text"
          value={newTerm}
          onChange={e => setNewTerm(e.target.value)}
          placeholder="Term"
          className="w-full text-[11px] px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-all"
        />
        <select
          value={newDept}
          onChange={e => setNewDept(e.target.value)}
          className="w-full text-[11px] px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-white"
        >
          <option value="">Select department</option>
          {departments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <input
          type="text"
          value={newMeaning}
          onChange={e => setNewMeaning(e.target.value)}
          placeholder="Enterprise meaning"
          className="w-full text-[11px] px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-all"
        />
        <button
          onClick={handleSave}
          disabled={!newTerm || !newDept || !newMeaning}
          className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold px-3 py-2
            bg-gray-900 text-white rounded-xl hover:bg-gray-800
            disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-[0.98]"
        >
          <Save size={11} />
          Save to Glossary
        </button>

        {saved.length > 0 && (
          <div className="space-y-1 pt-1.5 border-t border-gray-100">
            {saved.map((s, i) => (
              <div key={i} className="flex items-center gap-1 text-[9px] text-emerald-600 animate-fade-in">
                <Check size={9} />
                <span className="font-medium truncate">"{s.term}"</span>
                <span className="text-emerald-400 truncate">added to {s.dept}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
