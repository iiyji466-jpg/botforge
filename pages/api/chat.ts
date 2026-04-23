import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages, systemPrompt } = req.body

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://botforge-9rbn.vercel.app",
        "X-Title": "BotForge"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ]
      })
    })

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Chat error:', error)
    return res.status(500).json({ error: 'حدث خطأ في المعالجة' })
  }
}