import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. التحقق من أن الطلب POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, systemPrompt } = req.body

  // 2. التحقق من وجود البيانات المطلوبة
  if (!messages || !systemPrompt) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // 3. جلب مفتاح الـ API من إعدادات Vercel
  const apiKey = process.env.OPENROUTER_API_KEY
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured' })
  }

  try {
    // 4. إرسال الطلب إلى OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://bot-forge.vercel.app", // اختياري
      },
      body: JSON.stringify({
        "model": "anthropic/claude-3.5-sonnet", // يمكنك اختيار الموديل الذي تفضله
        "messages": [
          { "role": "system", "content": systemPrompt },
          ...messages
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch from OpenRouter');
    }

    // 5. إعادة الرد إلى واجهة الموقع
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
