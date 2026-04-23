import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'الطريقة غير مسموحة' })
  }

  try {
    const { messages, systemPrompt } = req.body

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gemini-2.0-flash-exp",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ]
        })
      }
    )

    const data = await response.json()
    
    // ✅ أضف هذا السطر للتشخيص
    console.log('Gemini Response:', JSON.stringify(data).substring(0, 200))
    
    if (!response.ok) {
      console.error('Gemini API Error:', data)
      return res.status(response.status).json({ 
        error: data.error?.message || 'خطأ في الاتصال بـ Gemini' 
      })
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error('Chat error:', error)
    return res.status(500).json({ error: 'حدث خطأ في المعالجة' })
  }
}