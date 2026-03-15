const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

// gemini-1.5-flash has the most generous free tier
const MODEL = 'gemini-2.5-flash-lite'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function callGemini(systemPrompt, userMessage, retries = 3) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_key_here') {
    return {
      success: false,
      text: '⚠️ Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.'
    }
  }

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${systemPrompt}\n\n---\n\n${userMessage}`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 512
    }
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Gemini call attempt ${attempt}...`)

      const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      // Log full response for debugging
      console.log('Gemini response status:', response.status)
      console.log('Gemini response data:', JSON.stringify(data, null, 2))

      if (response.status === 429) {
        const waitMs = attempt * 5000
        console.warn(`Rate limited. Waiting ${waitMs / 1000}s...`)
        if (attempt < retries) {
          await sleep(waitMs)
          continue
        }
        return {
          success: false,
          text: '⚠️ Gemini rate limit hit. Please wait 30 seconds and try again.'
        }
      }

      if (response.status === 400) {
        console.error('Bad request:', data)
        return {
          success: false,
          text: `⚠️ Bad request: ${data?.error?.message || 'Unknown error'}`
        }
      }

      if (response.status === 403) {
        return {
          success: false,
          text: '⚠️ API key is invalid or does not have access. Check your VITE_GEMINI_API_KEY.'
        }
      }

      if (!response.ok) {
        console.error('Gemini error:', data)
        return {
          success: false,
          text: `⚠️ Gemini error ${response.status}: ${data?.error?.message || 'Unknown error'}`
        }
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

      if (!text) {
        console.error('No text in response:', data)
        return {
          success: false,
          text: '⚠️ Gemini returned an empty response. Try again.'
        }
      }

      return { success: true, text }

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error)
      if (attempt === retries) {
        return {
          success: false,
          text: `⚠️ Connection error: ${error.message}`
        }
      }
      await sleep(attempt * 2000)
    }
  }
}
