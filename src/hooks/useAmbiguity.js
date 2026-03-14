import { useState, useCallback } from 'react'
import { scoreQuery } from '../utils/semanticFirewallEngine'

export function useAmbiguity() {
  const [liveScore, setLiveScore] = useState(null)

  const analyzeLive = useCallback((query, department, sessionMemory = {}) => {
    if (!query || query.trim().length < 2) {
      setLiveScore(null)
      return null
    }
    const result = scoreQuery(query, department, sessionMemory)
    setLiveScore(result)
    return result
  }, [])

  const clearAnalysis = useCallback(() => {
    setLiveScore(null)
  }, [])

  return { liveScore, analyzeLive, clearAnalysis }
}
