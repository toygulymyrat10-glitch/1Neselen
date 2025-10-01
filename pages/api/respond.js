import fetch from 'node-fetch'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { message } = req.body || {}
  if (!message) return res.status(400).json({ error: 'Boş mesaj' })

  const crisisKeywords = ['intihar', 'öldür', 'ölmek', 'yok olmak', 'kendine zarar']
  const lower = message.toLowerCase()
  for (const k of crisisKeywords) {
    if (lower.includes(k)) {
      return res.status(200).json({ reply: 'Bunu duyduğuma çok üzüldüm. Eğer kendine zarar verme düşüncen varsa lütfen acil olarak yerel yardım hatlarını ara veya güvendiğin bir kişiyle konuş. Türkiye için acil arama: 112. Profesyonel destek almak çok önemli.' })
    }
  }

  const OPENAI_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_KEY) return res.status(500).json({ error: 'Sunucu ayarlı değil: OPENAI_API_KEY eksik' })

  const systemPrompt = `Sen nazik, samimi, neşeli ve teselli edici bir yardımcısın. Kısa, insan odaklı, empatik cevaplar ver. Tıbbi ya da profesyonel öneri vermeden önce kullanıcıyı profesyonellere yönlendir.`

  try {
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.9
      })
    })
    const apiJson = await apiRes.json()
    const reply = apiJson?.choices?.[0]?.message?.content || 'Üzgünüm, cevap üretilirken hata oldu.'
    return res.status(200).json({ reply })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'AI çağrısında hata' })
  }
}
