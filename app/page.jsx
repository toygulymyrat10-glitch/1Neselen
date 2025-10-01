'use client'

import { useState } from 'react'

export default function Home() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim()) return
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, { ...userMsg, id: Date.now(), from: 'you' }])
    setText('')
    setLoading(true)
    try {
      const res = await fetch('/api/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content })
      })
      const data = await res.json()
      const botMsg = { role: 'assistant', content: data.reply }
      setMessages(prev => [...prev, { ...botMsg, id: Date.now()+1, from: 'ai' }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Üzgünüm, şu an cevap veremiyorum — birazdan tekrar deneyin.', id: Date.now()+2, from: 'ai' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">AnonVent — İçini dök, hafifle</h1>
        <p className="text-sm text-gray-600 mb-4">Kimliğin paylaşılmaz. Samimi, neşeli ve teskin edici cevaplar alırsın.</p>

        <div className="space-y-3 max-h-96 overflow-auto mb-4">
          {messages.length === 0 && (
            <div className="text-center text-sm text-gray-500">İçini dökmek için aşağıya yaz — burası güvenli bir alan.</div>
          )}
          {messages.map(m => (
            <div key={m.id} className={m.from === 'you' ? 'text-right' : 'text-left'}>
              <div className={`inline-block p-3 rounded-xl ${m.from === 'you' ? 'bg-indigo-50' : 'bg-rose-50'}`}>
                <div className="text-sm">{m.content}</div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="İçini dök..."
            className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none"
          />
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-60">Gönder</button>
        </form>

        <footer className="mt-4 text-xs text-gray-500">Gizlilik: Mesajlar varsayılan olarak saklanmaz. Sunucu ayarını değiştirmediysen hiçbir veri depolanmaz.</footer>
      </div>
    </main>
  )
}
