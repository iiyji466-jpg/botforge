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

      if (!response.ok) {
        throw new Error(data.error || 'خطأ في الاستجابة')
      }

      if (bot.id === 'downloader') {
        setMessages([...newMessages, {
          role: 'assistant',
          content: `✅ **تم استخراج الرابط!**\n\n🔗 [اضغط هنا للتحميل](${data.downloadUrl})`
        }])
      } else {
        const replyText = data.choices?.[0]?.message?.content || "عذراً، لم أتلقى رداً."
        setMessages([...newMessages, { role: 'assistant', content: replyText }])
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ')
      console.error('Send message error:', err)
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
        <title>{bot.nameAr}</title>
      </Head>
      <Toaster
        toastOptions={{
          style: {
            background: '#1e1e2f',
            color: '#fff',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
          },
          success: { iconTheme: { primary: '#00ff87', secondary: '#1e1e2f' } },
          error: { iconTheme: { primary: '#ff4b2b', secondary: '#1e1e2f' } }
        }}
      />
      <div
        className="min-h-screen flex flex-col text-white"
        dir="rtl"
        style={{
          background: 'radial-gradient(circle at 20% 30%, #1a1a2e, #0f0f1a)'
        }}
      >
        {/* Header أنيق */}
        <header className="sticky top-0 z-10 backdrop-blur-md bg-black/20 border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 text-white/40 hover:text-white/80 transition-colors text-sm"
          >
            <span className="text-lg leading-5">←</span> رجوع
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">{bot.icon}</span>
            <h1 className="text-base font-semibold tracking-wide">{bot.nameAr}</h1>
          </div>
          <div className="w-8" />
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-12 text-center">
              <div
                className="text-5xl mb-4 p-5 rounded-3xl"
                style={{
                  background: `linear-gradient(135deg, ${bot.color}20, ${bot.color}05)`,
                  backdropFilter: 'blur(8px)'
                }}
              >
                {bot.icon}
              </div>
              <h2 className="text-lg font-medium text-white/90">{bot.nameAr}</h2>
              <p className="text-white/40 text-sm mt-1 max-w-xs">{bot.descriptionAr}</p>

              {/* أزرار الأمثلة */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {bot.examples.slice(0, 3).map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(ex)}
                    className="px-4 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`relative max-w-[85%] px-5 py-3 text-sm leading-relaxed shadow-lg ${
                  msg.role === 'user'
                    ? 'rounded-2xl rounded-tr-sm text-white'
                    : 'rounded-2xl rounded-tl-sm text-white/90'
                }`}
                style={{
                  background: msg.role === 'user'
                    ? 'linear-gradient(145deg, #3b82f6, #2563eb)'
                    : 'rgba(255,255,255,0.05)',
                  backdropFilter: msg.role === 'assistant' ? 'blur(10px)' : 'none',
                  border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.05)' : 'none'
                }}
              >
                {msg.content.split('\n').map((line, idx) => (
                  <span key={idx}>
                    {line}
                    {idx !== msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
                <div
                  className={`absolute bottom-0 ${
                    msg.role === 'user' ? 'right-0 translate-x-1/4' : 'left-0 -translate-x-1/4'
                  } w-3 h-3 rotate-45`}
                  style={{
                    background: msg.role === 'user' ? '#2563eb' : 'rgba(255,255,255,0.02)'
                  }}
                />
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl rounded-tl-sm border border-white/5">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer input أنيق */}
        <footer className="p-4 border-t border-white/5 bg-black/10 backdrop-blur-sm">
          <div className="flex gap-3 items-end max-w-3xl mx-auto">
            <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
              <textarea
                className="w-full bg-transparent outline-none text-sm p-4 resize-none max-h-32"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={bot.placeholder || 'اكتب رسالتك...'}
                disabled={loading}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="shrink-0 bg-gradient-to-br from-blue-500 to-blue-700 text-white p-4 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 transition-all duration-200"
              style={{ boxShadow: '0 8px 20px rgba(59,130,246,0.25)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-white/20 text-[10px] mt-3">
            {bot.nameAr} • ردود ذكية وفورية
          </p>
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