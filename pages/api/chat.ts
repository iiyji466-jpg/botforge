import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from "@google/generative-ai";

// استدعاء المفتاح من متغيرات البيئة (Environment Variables)
// تأكد من إضافة GEMINI_API_KEY في إعدادات Vercel
const apiKey = process.env.GEMINI_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // السماح بطلبات POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'الطريقة غير مسموحة (Method Not Allowed)' });
  }

  // التحقق من وجود المفتاح البرمجي
  if (!apiKey) {
    console.error("خطأ: مفتاح GEMINI_API_KEY غير موجود في إعدادات النظام");
    return res.status(500).json({ error: 'إعدادات الخادم ناقصة: مفتاح API غير معرف' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const { messages, systemPrompt } = req.body;

    // إعداد النموذج (استخدام gemini-1.5-flash للسرعة والكفاءة)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt, // تخصيص سلوك البوت
    });

    // تحويل سجل المحادثة من تنسيق الواجهة إلى تنسيق Gemini (Role Mapping)
    // Gemini يستخدم 'model' بدلاً من 'assistant'
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // بدء الدردشة مع السجل السابق
    const chat = model.startChat({
      history: history,
    });

    // إرسال الرسالة الأخيرة من المستخدم
    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    // إرجاع الرد بتنسيق متوافق مع واجهة الشات الخاصة بك
    return res.status(200).json({ 
      choices: [{ 
        message: { 
          content: text 
        } 
      }] 
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error.message);
    return res.status(500).json({ 
      error: 'فشل في الاتصال بـ Gemini API',
      details: error.message 
    });
  }
}
