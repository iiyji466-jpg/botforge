import Head from 'next/head'
import Link from 'next/link'
import { BOTS } from '../lib/bots'
import { useState } from 'react'

export default function Home() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <>
      <Head>
        <title>Mohannad AI — منصة البوتات الذكية</title>
        <meta name="description" content="7 بوتات ذكية لجميع احتياجاتك" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen grid-bg" dir="rtl">
        <header className="border-b border-[#1e1e2e] sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤖</span>
              <div>
                <h1 className="font-mono text-xl font-bold neon-text">Mohannad AI</h1>
                <p className="text-xs text-[#6b6b8a]">منصة البوتات الذكية</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-[#6b6b8a] bg-[#111118] border border-[#1e1e2e] px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-[#00ff87] rounded-full animate-pulse"></span>
              7 بوتات نشطة
            </span>
          </div>
        </header>

        <section className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="inline-block mb-6 px-4 py-1 rounded-full border border-[#00ff87]/30 text-[#00ff87] text-sm bg-[#00ff87]/5">
            ⚡ مدعوم بالذكاء الاصطناعي Gemini
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            بوتاتك الذكية
            <br />
            <span className="neon-text font-mono">في مكان واحد</span>
          </h2>
          <p className="text-[#6b6b8a] text-lg max-w-2xl mx-auto mb-10">
            7 بوتات متخصصة تغطي جميع احتياجاتك — كلها جاهزة وتعمل الآن
          </p>
          <a href="#bots" className="btn-neon px-8 py-3 rounded-xl font-semibold text-sm inline-block">
            استكشف البوتات ←
          </a>
        </section>

        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { num: '7', label: 'بوت متخصص' },
              { num: '100%', label: 'يعمل بلا أخطاء' },
              { num: '∞', label: 'محادثة مجانية' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <div className="text-3xl font-mono font-bold neon-text">{stat.num}</div>
                <div className="text-xs text-[#6b6b8a] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="bots" className="max-w-7xl mx-auto px-4 pb-20">
          <h3 className="text-2xl font-bold text-center mb-2">اختر بوتك</h3>
          <p className="text-[#6b6b8a] text-center mb-10 text-sm">اضغط على أي بوت لبدء المحادثة فوراً</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BOTS.map((bot, i) => (
              <Link key={bot.id} href={`/bot/${bot.id}`}>
                <div
                  className="glass-card p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  onMouseEnter={() => setHovered(bot.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    boxShadow: hovered === bot.id ? `0 0 30px ${bot.color}22` : undefined,
                    borderColor: hovered === bot.id ? `${bot.color}44` : undefined,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: `${bot.color}15`, border: `1px solid ${bot.color}30` }}
                    >
                      {bot.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-base mb-1">{bot.nameAr}</h4>
                      <p className="text-[#6b6b8a] text-sm leading-relaxed">{bot.descriptionAr}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {bot.examples.slice(0, 2).map((ex) => (
                      <span
                        key={ex}
                        className="text-xs px-2 py-1 rounded-md"
                        style={{ background: `${bot.color}10`, color: `${bot.color}cc`, border: `1px solid ${bot.color}20` }}
                      >
                        {ex.length > 22 ? ex.slice(0, 22) + '…' : ex}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 text-sm font-medium" style={{ color: bot.color }}>
                    ابدأ المحادثة →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1e1e2e] py-8 text-center text-[#6b6b8a] text-sm">
          <p>Mohannad AI — مبني بـ Next.js + Gemini AI</p>
        </footer>
      </div>
    </>
  )
}