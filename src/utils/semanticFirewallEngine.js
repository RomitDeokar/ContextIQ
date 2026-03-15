import Fuse from 'fuse.js'
import vocab from '../data/enterprise_vocab.json'
import { detectLanguage } from './languageDetector'

const DEVANAGARI_ONLY = /^[\p{Script=Devanagari}]+$/u

const COMMON_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'need',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'up', 'about', 'into', 'through', 'during', 'before', 'after',
  'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both',
  'this', 'that', 'these', 'those', 'it', 'its', 'my', 'our',
  'your', 'his', 'her', 'their', 'what', 'which', 'who',
  'show', 'get', 'give', 'make', 'go', 'see', 'look', 'find',
  'me', 'us', 'them', 'him', 'she', 'he', 'we', 'they',
  'all', 'each', 'every', 'any', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'only', 'own', 'same', 'than', 'too',
  'very', 'just', 'also', 'now', 'how', 'here', 'there', 'when',
  'where', 'why', 'way', 'out', 'new', 'old', 'big', 'long',
  // Query filler words
  'report', 'data', 'status', 'update', 'please', 'check',
  'performance', 'delayed', 'shipment', 'issue', 'send',
])

let fuse = new Fuse(Object.keys(vocab), { threshold: 0.4, includeScore: true })

function refreshFuse() {
  // Keep fuzzy matching in sync when vocab expands
  if (typeof fuse?.setCollection === 'function') {
    fuse.setCollection(Object.keys(vocab))
  } else {
    fuse = new Fuse(Object.keys(vocab), { threshold: 0.4, includeScore: true })
  }
}

function mergeCustomVocabFromLocalStorage() {
  // Browser-only persistence layer (hackathon prototype)
  if (typeof window === 'undefined') return

  try {
    const stored = JSON.parse(localStorage.getItem('contextiq_custom_vocab') || '{}')
    if (!stored || typeof stored !== 'object') return

    for (const [term, defs] of Object.entries(stored)) {
      if (!Array.isArray(defs)) continue

      const key = String(term).toLowerCase()
      if (!vocab[key]) vocab[key] = []

      for (const def of defs) {
        if (!def?.dept || !def?.meaning) continue
        const exists = vocab[key].some(e => e.dept === def.dept && e.meaning === def.meaning)
        if (!exists) vocab[key].push({ dept: def.dept, meaning: def.meaning })
      }
    }

    refreshFuse()
  } catch {
    // ignore parse errors
  }
}

// Load any locally-saved glossary expansions on first import
mergeCustomVocabFromLocalStorage()

export function scoreQuery(query, department, sessionMemory = {}) {
  let score = 0
  const normalized = (query || '').normalize('NFKC')
  const words = normalized.toLowerCase().split(/\s+/).filter(Boolean)

  const detectedTerms = []
  const termDetails = []
  const wordAnalysis = []

  for (const word of words) {
    // Keep Latin letters and Devanagari characters
    const cleanWord = word.replace(/[^\p{Script=Devanagari}a-z]/gu, '')

    if (!cleanWord || cleanWord.length < 2) {
      wordAnalysis.push({ word, status: 'skip', score: 0 })
      continue
    }

    // Skip pure Devanagari tokens for glossary matching (glossary is English keys)
    if (DEVANAGARI_ONLY.test(cleanWord)) {
      wordAnalysis.push({ word: cleanWord, status: 'skip', score: 0 })
      continue
    }

    if (vocab[cleanWord]) {
      const meanings = vocab[cleanWord]
      const termScore = 30 + (meanings.length > 1 ? 25 : 0)
      score += termScore

      detectedTerms.push(cleanWord)
      termDetails.push({
        term: cleanWord,
        meanings,
        matchType: 'exact',
        contribution: termScore,
      })

      wordAnalysis.push({
        word: cleanWord,
        status: meanings.length > 1 ? 'ambiguous' : 'known',
        score: termScore,
        meaningCount: meanings.length,
      })

    } else {
      const fuzzyResults = fuse.search(cleanWord)

      if (fuzzyResults.length > 0 && fuzzyResults[0].score < 0.35) {
        const bestMatch = fuzzyResults[0]
        score += 5
        wordAnalysis.push({
          word: cleanWord,
          status: 'fuzzy',
          score: 5,
          fuzzyMatch: bestMatch.item,
          fuzzyScore: bestMatch.score,
        })

      } else {
        // Add unknown penalty only for words that look like potential enterprise terms
        if (COMMON_WORDS.has(cleanWord)) {
          wordAnalysis.push({ word: cleanWord, status: 'skip', score: 0 })
        } else {
          score += 15
          wordAnalysis.push({ word: cleanWord, status: 'unknown', score: 15 })
        }
      }
    }
  }

  // Language detection
  const langResult = detectLanguage(normalized)
  if (langResult.isMixed) score += 20

  // Missing department
  if (!department) score += 10

  // Session memory adjustment
  for (const term of detectedTerms) {
    const prior = sessionMemory[term]
    if (!prior) continue

    const currentDepts = vocab[term]?.map(d => d.dept) || []
    if (prior.resolvedDept && currentDepts.includes(prior.resolvedDept)) {
      score -= 10 // same meaning = more certainty
    } else {
      score += 10 // conflict detected
    }
  }

  // Department weighting
  if (department && detectedTerms.length > 0) {
    const deptMatch = detectedTerms.some(term => vocab[term]?.some(def => def.dept === department))
    if (deptMatch) score = Math.max(score - 20, 0)
  }

  const finalScore = Math.max(0, Math.min(score, 100))

  return {
    department,
    score: finalScore,
    detectedTerms,
    termDetails,
    wordAnalysis,
    language: langResult,
    trigger:
      finalScore > 60
        ? 'multiple glossary defs'
        : finalScore > 40
          ? 'moderate ambiguity'
          : 'resolved',
    action:
      finalScore > 60
        ? 'clarification required'
        : finalScore > 40
          ? 'gemini with warning'
          : 'passed to gemini',
    needsClarification: finalScore > 60,

    // Backwards compatible (typo kept) + corrected alias
    hasModeratAmbiguity: finalScore > 40 && finalScore <= 60,
    hasModerateAmbiguity: finalScore > 40 && finalScore <= 60,
  }
}

export function getTermMeanings(term, department) {
  const meanings = vocab[term.toLowerCase()]
  if (!meanings) return []
  if (department) {
    const deptMatch = meanings.find(m => m.dept === department)
    if (deptMatch) return [deptMatch]
  }
  return meanings
}

export function resolveTermForDept(term, department) {
  const meanings = vocab[term.toLowerCase()]
  if (!meanings) return null
  return meanings.find(m => m.dept === department) || null
}

export function getAllDepartments() {
  const deps = new Set()
  for (const term of Object.keys(vocab)) {
    for (const entry of vocab[term]) deps.add(entry.dept)
  }
  return Array.from(deps).sort()
}

export function getVocab() {
  return vocab
}

export function addToVocab(term, dept, meaning) {
  const key = term.toLowerCase()
  if (!vocab[key]) vocab[key] = []

  const exists = vocab[key].some(e => e.dept === dept && e.meaning === meaning)
  if (!exists) {
    vocab[key].push({ dept, meaning })
    refreshFuse()
  }

  return vocab[key]
}
