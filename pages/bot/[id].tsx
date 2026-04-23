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
          content: `✅ تم استخراج الرابط!\n\n🔗 [اضغط هنا للتحميل](${data.downloadUrl})` 
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
      <Toaster />
      <div className="min-h-screen flex flex-col text-white" dir="rtl" style={{ background: '#0a0a0f' }}>
        <header className="p-4 border-b border-white/10 flex justify-between items-center">
          <Link href="/" className="text-sm opacity-50 hover:opacity-100 transition">
            ← رجوع
          </Link>
          <h1 className="text-sm font-bold">{bot.nameAr}</h1>
          <div className="w-8"></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/30 text-sm mt-10">
              ابدأ المحادثة مع {bot.nameAr}...
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-white/10'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 p-3 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-4 border-t border-white/10">
          <div className="flex gap-2 bg-white/5 p-2 rounded-xl">
            <textarea 
              className="flex-1 bg-transparent outline-none text-sm resize-none" 
              rows={1} 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={handleKeyDown} 
              placeholder="اكتب هنا..." 
              disabled={loading}
            />
            <button 
              onClick={() => sendMessage()} 
              disabled={loading || !input.trim()}
              className="bg-blue-600 px-4 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
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