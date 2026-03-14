export function buildSystemPrompt(department, resolvedTerms = []) {
  let base = `You are ContextIQ, an enterprise AI assistant. You operate inside a semantic firewall that resolves meaning before generating responses.`

  if (department) {
    base += `\n\nThe user is currently in the "${department}" department. All terms should be interpreted in the context of this department.`
  }

  if (resolvedTerms.length > 0) {
    base += `\n\nThe following enterprise terms have been resolved by the semantic firewall:`
    for (const rt of resolvedTerms) {
      base += `\n- "${rt.term}" means "${rt.meaning}" (in ${rt.dept} context)`
    }
  }

  base += `\n\nRules:
1. Always use the resolved enterprise meanings for terms, never general/public meanings.
2. Keep responses concise and professional.
3. If context is insufficient, say so clearly.
4. Reference the department context in your response when relevant.
5. Never make assumptions about ambiguous terms - the firewall has already resolved them for you.`

  return base
}

export function buildQueryPrompt(query, scoreResult, department) {
  let prompt = query

  if (scoreResult.hasModeratAmbiguity) {
    prompt += `\n\n[SYSTEM NOTE: This query has moderate ambiguity (score: ${scoreResult.score}/100). Detected terms: ${scoreResult.detectedTerms.join(', ')}. Language: ${scoreResult.language.label}. Please be careful with term interpretation and note any assumptions.]`
  }

  return prompt
}

export function buildClarificationPrompt(term, meanings) {
  return `The term "${term}" has ${meanings.length} possible enterprise meanings:\n${meanings.map((m, i) => `${i + 1}. In ${m.dept}: ${m.meaning}`).join('\n')}\n\nWhich context applies to your current query?`
}
