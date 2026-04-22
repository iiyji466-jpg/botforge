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
      // التحقق: إذا كان البوت هو "صياد المقاطع"، نتوجه لمحرك التحميل الجديد
      if (bot.id === 'downloader') {
        const response = await fetch('/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: content }),
        })
        const data = await response.json()
        
        if (data.success) {
          setMessages([...newMessages, { 
            role: 'assistant', 
            content: `✅ تم استخراج الرابط بنجاح!\n\n🔗 [اضغط هنا لتحميل الفيديو مباشرة](${data.downloadUrl})` 
          }])
        } else {
          throw new Error(data.error || 'فشل في استخراج الرابط')
        }
      } else {
        // لبقية البوتات، نستخدم الدردشة العادية
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages, systemPrompt: bot.systemPrompt }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'خطأ في الاتصال')
        setMessages([...newMessages, { role: 'assistant', content: data.reply || data.choices?.[0]?.message?.content }])
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ غير متوقع')
      setMessages(newMessages)
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
      <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: '#0a0a0f' }}>
        <header className="border-b sticky top-0 z-50 backdrop-blur-xl" style={{ borderColor: `${bot.color}20`, background: `${bot.color}05` }}>
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-[#6b6b8a] hover:text-white text-sm">← رجوع</Link>
              <div className="w-px h-4 bg-[#1e1e2e]"></div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: `${bot.color}15` }}>
                {bot.icon}
              </div>
              <div>
                <h1 className="font-semibold text-sm">{bot.nameAr}</h1>
                <p className="text-xs flex items-center gap-1" style={{ color: bot.color }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse inline-block"></span>
                  متصل
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <button onClick={() => setMessages([])} className="text-xs text-[#6b6b8a] hover:text-white px-3 py-1.5 rounded-lg border border-[#1e1e2e]">
                مسح
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-4 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6" style={{ background: `${bot.color}10`, border: `2px solid ${bot.color}30` }}>
                {bot.icon}
              </div>
              <h2 className="text-xl font-bold mb-2">{bot.nameAr}</h2>
              <p className="text-[#6b6b8a] text-sm mb-8">{bot.descriptionAr}</p>
              <div className="flex flex-wrap gap-3 justify-center max-w-xl mx-auto">
                {bot.examples.map((ex) => (
                  <button key={ex} onClick={() => sendMessage(ex)}
                    className="text-sm px-4 py-2 rounded-xl border transition-all hover:-translate-y-0.5"
                    style={{ background: `${bot.color}08`, borderColor: `${bot.color}30`, color: `${bot.color}cc` }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 mt-1" style={{ background: `${bot.color}15` }}>
                      {bot.icon}
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'msg-user font-medium' : 'msg-bot text-[#e0e0f0]'}`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-[#1e1e2e] shrink-0 mt-1">👤</div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: `${bot.color}15` }}>{bot.icon}</div>
                  <div className="msg-bot px-4 py-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full dot-1" style={{ background: bot.color }}></span>
                    <span className="w-2 h-2 rounded-full dot-2" style={{ background: bot.color }}></span>
                    <span className="w-2 h-2 rounded-full dot-3" style={{ background: bot.color }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-[#1e1e2e] sticky bottom-0 bg-[#0a0a0f]/95 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex gap-3 items-end bg-[#111118] border border-[#1e1e2e] rounded-2xl p-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={bot.placeholder}
                rows={1}
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-white placeholder-[#6b6b8a] resize-none outline-none max-h-32"
                style={{ direction: 'rtl' }}
                onInput={(e) => {
                  const t = e.currentTarget
                  t.style.height = 'auto'
                  t.style.height = Math.min(t.scrollHeight, 128) + 'px'
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                style={{ background: input.trim() && !loading ? bot.color : '#1e1e2e', color: input.trim() && !loading ? '#0a0a0f' : '#6b6b8a' }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </div>
            <p className="text-center text-[#3a3a5a] text-xs mt-2">Enter للإرسال • Shift+Enter لسطر جديد</p>
          </div>
        </div>
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
