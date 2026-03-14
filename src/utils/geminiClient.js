const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function callGemini(systemPrompt, userMessage) {
  if (!GEMINI_API_KEY) {
    return {
      success: false,
      text: '[Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env file.]'
    }
  }

  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1024
        }
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini API error:', err)
      return {
        success: false,
        text: `[Gemini API error: ${response.status}]`
      }
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[No response generated]'

    return { success: true, text }
  } catch (error) {
    console.error('Gemini call failed:', error)
    return {
      success: false,
      text: `[Connection error: ${error.message}]`
    }
  }
}
