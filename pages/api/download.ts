import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'يرجى وضع رابط صالح' });

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
        filenameStyle: "pretty"
      })
    });

    const data = await response.json();
    
    // كوبالت قد يعيد الرابط في data.url أو data.picker
    const downloadUrl = data.url || (data.picker && data.picker[0]?.url);

    if (downloadUrl) {
      return res.status(200).json({ success: true, downloadUrl });
    } else {
      return res.status(400).json({ error: 'تعذر استخراج الرابط، جرب رابطاً آخر' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'المحرك مشغول حالياً، حاول لاحقاً' });
  }
}
