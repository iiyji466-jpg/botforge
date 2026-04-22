import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'الطريقة غير مسموحة' });

  const { url } = req.body;
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
        videoQuality: "720",
      })
    });

    const data = await response.json();

    // التحقق من وجود رابط مباشر أو قائمة اختيار (Picker)
    const directUrl = data.url || (data.picker && data.picker[0]?.url);

    if (directUrl) {
      return res.status(200).json({
        success: true,
        downloadUrl: directUrl
      });
    } else {
      return res.status(400).json({ error: 'لم أتمكن من العثور على رابط مباشر' });
    }

  } catch (error) {
    return res.status(500).json({ error: 'المحرك لا يستجيب، حاول مجدداً' });
  }
}
