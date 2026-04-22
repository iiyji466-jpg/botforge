import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { BOTS, Bot } from '../../lib/bots'
import toast, { Toaster } from 'react-hot-toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function BotPage({ bot }: { bot: Bot }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const content = text || input.trim()
    if (!content || loading) return
    const userMessage: Message = { role: 'user', content }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      // التوجيه الذكي بناءً على نوع البوت
      const endpoint = bot.id === 'downloader' ? '/api/download' : '/api/chat'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: content, 
          messages: newMessages, 
          systemPrompt: bot.systemPrompt 
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'خطأ في الاستجابة')

      if (bot.id === 'downloader') {
        // نتيجة بوت التحميل
        setMessages([...newMessages, { 
          role: 'assistant', 
          content: `✅ تم استخراج الرابط بنجاح!\n\n🔗 [اضغط هنا لتحميل الفيديو مباشرة](${data.downloadUrl})` 
        }])
      } else {
        // نتيجة بوتات الدردشة (المترجم وغيرها) - قراءة مسار OpenRouter
        const replyText = data.reply || data.choices?.[0]?.message?.content || "عذراً، لم أتمكن من معالجة الرد."
        setMessages([...newMessages, { role: 'assistant', content: replyText }])
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      <Head>
        <title>{bot.nameAr} — BotForge</title>
      </Head>
      <Toaster />
      <div className="min-h-screen flex flex-col font-sans" dir="rtl" style={{ background: '#0a0a0f' }}>
        <header className="border-b sticky top-0 z-50 backdrop-blur-xl border-white/10" style={{ background: `${bot.color}05` }}>
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-[#6b6b8a] hover:text-white text-sm">← رجوع</Link>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: `${bot.color}15` }}>{bot.icon}</div>
              <h1 className="font-semibold text-sm">{bot.nameAr}</h1>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-4 py-6 text-white">
          {messages.length === 0 ? (
            <div className="text-center py-20 opacity-60">
              <div className="text-5xl mb-4">{bot.icon}</div>
              <h2 className="text-xl font-bold">{bot.nameAr}</h2>
              <p className="text-sm mt-2">{bot.descriptionAr}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600' : 'bg-white/10'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && <div className="text-xs opacity-50 animate-pulse">جاري المعالجة...</div>}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <footer className="p-4 bg-[#0a0a0f] border-t border-white/10 sticky bottom-0">
          <div className="max-w-4xl mx-auto flex gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
            <textarea
              className="flex-1 bg-transparent p-2 outline-none text-white text-sm resize-none"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={bot.placeholder}
            />
            <button 
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 disabled:opacity-30 transition-all"
            >
              إرسال
            </button>
          </div>
        </footer>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = BOTS.map((bot) => ({ params: { id: bot.id } }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const bot = BOTS.find((b) => b.id === params?.id)
  if (!bot) return { notFound: true }
  return { props: { bot } }
}
