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
      // إصلاح: التوجيه الذكي بين ملف التحميل وملف الدردشة
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
        // إصلاح: عرض رابط التحميل المباشر بعد استخراجه من المحرك
        setMessages([...newMessages, { 
          role: 'assistant', 
          content: `✅ تم استخراج الرابط بنجاح!\n\n🔗 [اضغط هنا لتحميل الفيديو مباشرة](${data.downloadUrl})` 
        }])
      } else {
        // إصلاح: قراءة رد الذكاء الاصطناعي بشكل صحيح من OpenRouter لضمان ظهور الرد
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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
