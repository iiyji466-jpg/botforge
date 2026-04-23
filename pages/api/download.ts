import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // السماح فقط بـ POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { url } = req.body
    
    if (!url) {
      return res.status(400).json({ error: 'الرابط مطلوب' })
    }

    // استخراج الرابط من النص
    const urlMatch = url.match(/(https?:\/\/[^\s]+)/g)
    const cleanUrl = urlMatch ? urlMatch[0] : url

    // استدعاء cobalt API
    const response = await fetch("https://api.cobalt.tools/api/json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        url: cleanUrl,
        videoQuality: "720",
      })
    })

    const data = await response.json()
    
    if (data.url) {
      return res.status(200).json({ 
        success: true, 
        downloadUrl: data.url 
      })
    } else if (data.picker && data.picker[0]?.url) {
      return res.status(200).json({ 
        success: true, 
        downloadUrl: data.picker[0].url 
      })
    } else {
      return res.status(400).json({ 
        error: 'عذراً، هذا الرابط غير مدعوم حالياً' 
      })
    }
  } catch (error) {
    console.error('Download error:', error)
    return res.status(500).json({ 
      error: 'حدث خطأ في المعالجة' 
    })
  }
}