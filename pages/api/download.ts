import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // التأكد من أن الطلب POST
  if (req.method !== 'POST') return res.status(405).json({ error: 'الطريقة غير مسموحة' });

  const { url, quality } = req.body; // نستقبل الرابط والجودة المطلوبة

  if (!url) return res.status(400).json({ error: 'الرابط مطلوب' });

  try {
    const response = await fetch("https://api.cobalt.tools/api/json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        url: url,
        videoQuality: quality || "720", // جودة تلقائية 720
        filenamePattern: "pretty",      // اسم ملف مرتب
        isAudioOnly: false,             // إذا كنت تريد تحميل صوت فقط غيرها لـ true
        disableMetadata: false          // جلب معلومات الفيديو (العنوان، الغلاف)
      })
    });

    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(data.text);
    }

    // إرجاع النتيجة النهائية (رابط التحميل المباشر)
    return res.status(200).json({
      success: true,
      downloadUrl: data.url,
      title: data.pickerItem?.[0]?.text || "Video"
    });

  } catch (error: any) {
    console.error('Download Error:', error);
    return res.status(500).json({ error: 'فشل المحرك في استخراج الفيديو، تأكد من الرابط.' });
  }
}
