import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'الطريقة غير مسموحة' });
  }

  try {
    const { messages, systemPrompt } = req.body;
    
    // استخدام موديل Gemini 1.5 Flash للسرعة والكفاءة
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt, // هنا نمرر تعليمات البوت (مترجم، مدير مجموعات، إلخ)
    });

    // تحويل التاريخ البرمجي لشكل يفهمه Gemini
    const chat = model.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    // نرسل الرد بنفس التنسيق الذي تتوقعه صفحة [id].tsx
    return res.status(200).json({ 
      choices: [{ message: { content: text } }] 
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: 'حدث خطأ في الاتصال بمحرك الذكاء الاصطناعي' });
  }
}
