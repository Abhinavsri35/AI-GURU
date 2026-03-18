const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`

const callGemini = async (prompt) => {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err?.error?.message || 'Gemini API error')
  }
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export const generateQuestions = async (topic, difficulty, count) => {
  const prompt = `
You are an expert educator. Generate exactly ${count} multiple-choice questions about "${topic}" at ${difficulty} difficulty level.

STRICT OUTPUT FORMAT — return ONLY valid JSON, no markdown, no explanation:
{
  "questions": [
    {
      "questionText": "Full question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The exact text of the correct option"
    }
  ]
}

Rules:
- Each question must have exactly 4 options
- correctAnswer must be exactly one of the 4 options (copy verbatim)
- Questions should be clear and unambiguous
- Vary question types: definition, application, comparison
`
  const raw = await callGemini(prompt)

  const cleaned = raw.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(cleaned)
  return parsed.questions
}


export const analyzePerformance = async (questions, answers) => {
  const breakdown = questions.map((q, i) => {
    const isCorrect = answers[i] === q.correctAnswer
    return `Q${i + 1}: "${q.questionText}" — Student answered: "${answers[i] || 'No answer'}" — ${isCorrect ? '✓ Correct' : `✗ Wrong (correct: "${q.correctAnswer}")`}`
  }).join('\n')

  const prompt = `
You are a helpful tutor. A student just completed a quiz. Analyze their performance below and provide personalized, constructive feedback.

Performance breakdown:
${breakdown}

Provide feedback in this structure:
1. Overall performance summary (1-2 sentences)
2. Topics/concepts the student needs to review (be specific)  
3. Concrete study recommendations (2-3 actionable tips)
4. One encouraging closing remark

Keep it concise, friendly, and motivating. No bullet points — use short paragraphs.
`
  return await callGemini(prompt)
}


export const getQuestionHint = async (questionText, correctAnswer) => {
  const prompt = `
A student is struggling with this question: "${questionText}"
The correct answer is: "${correctAnswer}"

Give a short, helpful hint (2-3 sentences) that guides the student toward the answer WITHOUT revealing the answer directly. Focus on the underlying concept.
`
  return await callGemini(prompt)
}
