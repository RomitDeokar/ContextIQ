const DEVANAGARI_CHAR = /\p{Script=Devanagari}/u
const DEVANAGARI_GLOBAL = /\p{Script=Devanagari}/gu

// Common Hinglish/Hindi words written in Latin script.
// This is heuristic by design (hackathon-safe, no external API).
const HINDI_COMMON_WORDS = new Set([
  'ka', 'ki', 'ke', 'ko', 'hai', 'hain', 'tha', 'thi', 'the',
  'me', 'mein', 'se', 'par', 'pe', 'ye', 'yeh', 'wo', 'woh',
  'aur', 'ya', 'nahi', 'nahin', 'kya', 'kaise', 'kyun', 'kab',
  'kahan', 'kitna', 'kitni', 'kitne', 'sabhi', 'sab', 'kuch',
  'bahut', 'zyada', 'kam', 'bhi', 'sirf', 'abhi', 'jab', 'tab',
  'agar', 'lekin', 'magar', 'toh', 'phir', 'pehle', 'baad',
  'dikha', 'dikhao', 'batao', 'bata', 'karo', 'karna', 'karenge',
  'chahiye', 'hoga', 'hogi', 'honge', 'raha', 'rahi', 'rahe',
  'wala', 'wali', 'wale', 'liye', 'dena', 'lena', 'jana', 'aana',
  'dekho', 'bhai', 'yaar', 'accha', 'theek',
  'samajh', 'samjha', 'samjho', 'pata', 'lagao', 'bhejo', 'bhej',
  'mujhe', 'humko', 'unko', 'isko', 'usko', 'apna', 'apni', 'apne',
])

export function detectLanguage(text) {
  if (!text || text.trim().length === 0) {
    return { code: 'und', isMixed: false, label: 'Unknown' }
  }

  const normalized = text.normalize('NFKC')
  const totalChars = normalized.replace(/\s/g, '').length
  const devanagariCount = (normalized.match(DEVANAGARI_GLOBAL) || []).length
  const devanagariRatio = totalChars > 0 ? devanagariCount / totalChars : 0

  const words = normalized.toLowerCase().split(/\s+/).filter(Boolean)
  let hindiWordCount = 0
  let englishWordCount = 0

  for (const word of words) {
    const cleanWord = word.replace(/[^\p{Script=Devanagari}a-z]/gu, '')
    if (!cleanWord) continue

    if (DEVANAGARI_CHAR.test(cleanWord)) {
      hindiWordCount++
    } else if (HINDI_COMMON_WORDS.has(cleanWord)) {
      hindiWordCount++
    } else if (/^[a-z]+$/.test(cleanWord)) {
      englishWordCount++
    }
  }

  const totalWords = hindiWordCount + englishWordCount
  const hindiRatio = totalWords > 0 ? hindiWordCount / totalWords : 0

  // Strong Hindi signal (mostly Devanagari)
  if (devanagariRatio > 0.7) {
    return { code: 'hin', isMixed: false, label: 'Hindi' }
  }

  // Mixed script (Devanagari + English words)
  if (DEVANAGARI_CHAR.test(normalized) && englishWordCount > 0) {
    return { code: 'hin+eng', isMixed: true, label: 'Hinglish' }
  }

  // Mixed language (Latin-script Hindi words + English)
  if (hindiRatio > 0.15 && englishWordCount > 0) {
    return { code: 'hin+eng', isMixed: true, label: 'Hinglish' }
  }

  // Mostly Hindi words in Latin script
  if (hindiRatio > 0.8) {
    return { code: 'hin', isMixed: false, label: 'Hindi' }
  }

  return { code: 'eng', isMixed: false, label: 'English' }
}
