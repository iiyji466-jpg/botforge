import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from "@google/generative-ai";

// سيقوم Vercel بحقن القيمة هنا تلقائياً من الإعدادات
const apiKey = process.env.GEMINI_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'الطريقة غير مسموحة' });
  }

  // التأكد من أن المفتاح تم التعرف عليه من قبل النظام
  if (!apiKey) {
    console.error("خطأ: GEMINI_API_KEY غير معرف في إعدادات Vercel");
    return res.status(500).json({ error: 'إعدادات الخادم ناقصة (API Key)' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const { messages, systemPrompt } = req.body;
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user', // تصحيح المسميات لـ Gemini
        parts: [{ text: m.content }],
      })),
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    
    return res.status(200).json({ 
      choices: [{ message: { content: response.text() } }] 
    });

  } catch (error: any) {
    console.error("Gemini Error:", error.message);
    return res.status(500).json({ error: 'فشل في جلب الرد من Gemini' });
  }
}
