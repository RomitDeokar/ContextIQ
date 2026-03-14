const HINDI_CHARS = /[\u0900-\u097F]/
const DEVANAGARI_RANGE = /[\u0900-\u097F]/g

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
  'report', 'data', 'dekho', 'bhai', 'yaar', 'accha', 'theek',
  'samajh', 'samjha', 'samjho', 'pata', 'lagao', 'bhejo', 'bhej',
  'mujhe', 'humko', 'unko', 'isko', 'usko', 'apna', 'apni', 'apne'
])

export function detectLanguage(text) {
  if (!text || text.trim().length === 0) {
    return { code: 'und', isMixed: false, label: 'Unknown' }
  }

  const hasDevanagari = HINDI_CHARS.test(text)
  const devanagariCount = (text.match(DEVANAGARI_RANGE) || []).length
  const totalChars = text.replace(/\s/g, '').length

  const words = text.toLowerCase().split(/\s+/).filter(Boolean)
  let hindiWordCount = 0
  let englishWordCount = 0

  for (const word of words) {
    const cleanWord = word.replace(/[^a-z\u0900-\u097F]/g, '')
    if (!cleanWord) continue

    if (HINDI_CHARS.test(cleanWord)) {
      hindiWordCount++
    } else if (HINDI_COMMON_WORDS.has(cleanWord)) {
      hindiWordCount++
    } else if (/^[a-z]+$/.test(cleanWord)) {
      englishWordCount++
    }
  }

  const totalWords = hindiWordCount + englishWordCount
  const hindiRatio = totalWords > 0 ? hindiWordCount / totalWords : 0
  const devanagariRatio = totalChars > 0 ? devanagariCount / totalChars : 0

  if (devanagariRatio > 0.7) {
    return { code: 'hin', isMixed: false, label: 'Hindi' }
  }

  if (hasDevanagari && englishWordCount > 0) {
    return { code: 'hin+eng', isMixed: true, label: 'Hinglish' }
  }

  if (hindiRatio > 0.15 && englishWordCount > 0) {
    return { code: 'hin+eng', isMixed: true, label: 'Hinglish' }
  }

  if (hindiRatio > 0.8) {
    return { code: 'hin', isMixed: false, label: 'Hindi' }
  }

  return { code: 'eng', isMixed: false, label: 'English' }
}
