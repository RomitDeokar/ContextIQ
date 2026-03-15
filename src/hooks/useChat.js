import { useState, useCallback, useRef, useEffect } from 'react'
import { scoreQuery, resolveTermForDept } from '../utils/semanticFirewallEngine'
import { callGemini } from '../utils/geminiClient'
import { buildSystemPrompt, buildQueryPrompt } from '../utils/promptTemplates'

export function useChat() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionMemory, setSessionMemory] = useState(() => {
    if (typeof window === 'undefined') return {}
    try {
      return JSON.parse(localStorage.getItem('contextiq_session_memory') || '{}') || {}
    } catch {
      return {}
    }
  })
  const [decisions, setDecisions] = useState([])
  const [currentTrace, setCurrentTrace] = useState(null)
  const [pendingClarification, setPendingClarification] = useState(null)
  const pendingQueryRef = useRef(null)
  const sessionMemoryRef = useRef({})

  // Persist session memory (auditability + live learning across reloads)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('contextiq_session_memory', JSON.stringify(sessionMemory))
    } catch {
      // ignore storage errors
    }
  }, [sessionMemory])

  // Keep ref in sync with state
  const updateSessionMemory = (updater) => {
    setSessionMemory(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      sessionMemoryRef.current = next
      return next
    })
  }

  const addMessage = useCallback((role, text, meta = {}) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      role,
      text,
      timestamp: new Date(),
      ...meta
    }])
  }, [])

  const callGeminiWithContext = useCallback(async (query, department, scoreResult) => {
    const resolvedTerms = []
    const memory = sessionMemoryRef.current

    for (const term of scoreResult.detectedTerms) {
      if (department) {
        const resolved = resolveTermForDept(term, department)
        if (resolved) {
          resolvedTerms.push({ term, ...resolved })
        }
      }
      const prior = memory[term]
      if (prior) {
        resolvedTerms.push({ term, dept: prior.resolvedDept, meaning: prior.meaning })
      }
    }

    const systemPrompt = buildSystemPrompt(department, resolvedTerms)
    const queryPrompt = buildQueryPrompt(query, scoreResult, department)
    const response = await callGemini(systemPrompt, queryPrompt)

    addMessage('assistant', response.text, {
      resolvedTerms,
      scoreResult
    })
  }, [addMessage])

  const processQuery = useCallback(async (query, department) => {
    addMessage('user', query)
    setIsLoading(true)

    const memory = sessionMemoryRef.current
    const result = scoreQuery(query, department, memory)
    setCurrentTrace(result)

    // Record decision
    const decision = {
      term: result.detectedTerms.join(', ') || query.split(' ')[0],
      dept: department || 'no dept',
      score: result.score,
      action: result.action,
      language: result.language.label,
      timestamp: new Date()
    }
    setDecisions(prev => [...prev, decision])

    if (result.needsClarification) {
      // Find the most ambiguous term
      const ambiguousTerm = result.termDetails.find(t => t.meanings.length > 1)
      if (ambiguousTerm) {
        setPendingClarification({
          term: ambiguousTerm.term,
          meanings: ambiguousTerm.meanings,
          query,
          scoreResult: result
        })
        pendingQueryRef.current = { query, department, result }

        addMessage('system', null, {
          type: 'clarification',
          term: ambiguousTerm.term,
          meanings: ambiguousTerm.meanings,
          scoreResult: result
        })
        setIsLoading(false)
        return result
      }
    }

    // Score <= 60: call Gemini
    await callGeminiWithContext(query, department, result)
    setIsLoading(false)
    return result
  }, [addMessage, callGeminiWithContext])

  const resolveClarification = useCallback(async (term, selectedMeaning, department) => {
    setIsLoading(true)
    setPendingClarification(null)

    // Update session memory
    updateSessionMemory(prev => ({
      ...prev,
      [term]: { resolvedDept: selectedMeaning.dept, meaning: selectedMeaning.meaning }
    }))

    addMessage('user', `I mean "${term}" as: ${selectedMeaning.meaning} (${selectedMeaning.dept})`, {
      type: 'resolution'
    })

    const pending = pendingQueryRef.current
    if (pending) {
      const resolvedTerms = [{ term, meaning: selectedMeaning.meaning, dept: selectedMeaning.dept }]
      const systemPrompt = buildSystemPrompt(department || selectedMeaning.dept, resolvedTerms)
      const queryPrompt = buildQueryPrompt(pending.query, pending.result, department)

      const response = await callGemini(systemPrompt, queryPrompt)
      addMessage('assistant', response.text, {
        resolvedTerms,
        scoreResult: pending.result
      })
      pendingQueryRef.current = null
    }

    setIsLoading(false)
  }, [addMessage])

  const clearChat = useCallback(() => {
    setMessages([])
    setDecisions([])
    setCurrentTrace(null)
    setPendingClarification(null)
    updateSessionMemory({})
    pendingQueryRef.current = null
  }, [])

  return {
    messages,
    isLoading,
    decisions,
    currentTrace,
    pendingClarification,
    sessionMemory,
    processQuery,
    resolveClarification,
    clearChat
  }
}
