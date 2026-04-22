// دالة لاستخراج الرابط فقط من وسط النص
const extractUrl = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const result = text.match(urlRegex);
  return result ? result[0] : null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'الطريقة غير مسموحة' });

  const { url: rawInput } = req.body;
  const url = extractUrl(rawInput); // هنا نقوم بتنظيف الرابط من الكلام الزائد

  if (!url) return res.status(400).json({ error: 'لم يتم العثور على رابط صالح في النص' });

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
    const directUrl = data.url || (data.picker && data.picker[0]?.url);

    if (directUrl) {
      return res.status(200).json({ success: true, downloadUrl: directUrl });
    } else {
      return res.status(400).json({ error: 'عذراً، هذا الرابط غير مدعوم حالياً' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'المحرك مشغول، حاول مرة أخرى' });
  }
}
