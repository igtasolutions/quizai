'use client'

import { useState, useEffect, useCallback } from 'react'

interface QuizBlock {
  id: string
  type: string
  label: string
  title: string
  subtitle: string
  options: string[]
}

interface Quiz {
  id: string
  user_id: string
  title: string
  slug: string
  blocks: QuizBlock[]
  pixel_id: string | null
  product: any
  settings: any
}

interface LeadAnswer {
  step: number
  option: string
  text: string
  time_spent_ms: number
}

export default function QuizPlayer({ quiz }: { quiz: Quiz }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<LeadAnswer[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [leadData, setLeadData] = useState({ name: '', email: '', phone: '' })
  const [stepStartTime, setStepStartTime] = useState(Date.now())

  const blocks = quiz.blocks as QuizBlock[]
  const currentBlock = blocks[currentStep]
  const totalSteps = blocks.length
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100)

  const track = useCallback(async (event_type: string, step?: number, metadata?: object) => {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quiz_id: quiz.id,
        lead_id: leadId,
        session_id: sessionId,
        event_type,
        step: step ?? currentStep,
        metadata,
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      }),
    })
  }, [quiz.id, leadId, sessionId, currentStep])

  useEffect(() => {
    track('quiz_start', 0)
  }, [])

  useEffect(() => {
    track('step_view', currentStep)
    setStepStartTime(Date.now())
    setSelectedOption(null)
  }, [currentStep])

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(s => s + 1)
    }
  }, [currentStep, totalSteps])

  const selectOption = async (option: string, index: number) => {
    setSelectedOption(option)
    const answer: LeadAnswer = {
      step: currentStep,
      option: String.fromCharCode(65 + index),
      text: option,
      time_spent_ms: Date.now() - stepStartTime,
    }
    setAnswers(prev => [...prev, answer])
    await track('step_complete', currentStep, { option: answer.option })
    setTimeout(() => goNext(), 350)
  }

  const submitLead = async () => {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quiz_id: quiz.id,
        user_id: quiz.user_id,
        ...leadData,
        answers,
        step_reached: currentStep,
        total_steps: totalSteps,
        session_id: sessionId,
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      }),
    })
    const { lead } = await res.json()
    if (lead) {
      setLeadId(lead.id)
      if (quiz.pixel_id && (window as any).fbq) {
        (window as any).fbq('track', 'Lead')
      }
      goNext()
    }
  }

  const handleCTAClick = () => {
    track('cta_click', currentStep)
    if (quiz.pixel_id && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout')
    }
    const checkoutUrl = quiz.product?.checkout_url
    if (checkoutUrl) window.open(checkoutUrl, '_blank')
  }

  const renderTitle = (text: string) => {
    const parts = text.split(/\*([^*]+)\*/)
    return parts.map((part, i) =>
      i % 2 === 1
        ? <span key={i} className="text-blue-400">{part}</span>
        : <span key={i}>{part}</span>
    )
  }

  if (!currentBlock) return null

  return (
    <div className="min-h-screen bg-[#05090f] text-[#eef2ff]">
      <div className="sticky top-0 z-50 bg-[#0a1120]/95 border-b border-[#162035] px-5 py-3 flex items-center justify-between backdrop-blur">
        <div className="font-bold text-lg tracking-tight">
          Quiz<span className="text-blue-400">AI</span>
        </div>
        <div className="flex-1 max-w-[180px] mx-4">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[10px] text-[#4e6a90] mt-1 text-right">
            {currentStep + 1} de {totalSteps}
          </div>
        </div>
        <div className="text-xs text-[#4e6a90] font-medium">
          {String(currentStep + 1).padStart(2,'0')}/{String(totalSteps).padStart(2,'0')}
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-8">
        <div className="flex items-center gap-2 text-[10px] tracking-[1.5px] text-blue-400 uppercase mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          {currentBlock.label}
        </div>

        <h1 className="font-bold text-2xl leading-tight mb-3">
          {renderTitle(currentBlock.title)}
        </h1>

        {currentBlock.subtitle && (
          <p className="text-sm text-[#4e6a90] leading-relaxed mb-6">
            {currentBlock.subtitle}
          </p>
        )}

        {currentBlock.type === 'question' && currentBlock.options.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            {currentBlock.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => selectOption(opt, i)}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                  selectedOption === opt
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-[#162035] bg-[#0d1829] hover:border-blue-500/40'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-semibold flex-shrink-0 mt-0.5 transition-all ${
                  selectedOption === opt
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-[#4e6a90] text-[#4e6a90]'
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="text-sm leading-relaxed">{opt}</span>
              </button>
            ))}
          </div>
        )}

        {currentBlock.type === 'capture' && (
          <div className="flex flex-col gap-3 mb-6">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1.5">Nome</label>
              <input
                value={leadData.name}
                onChange={e => setLeadData(d => ({ ...d, name: e.target.value }))}
                placeholder="Seu nome"
                className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-3 text-sm focus:outline-none text-[#eef2ff]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1.5">E-mail</label>
              <input
                type="email"
                value={leadData.email}
                onChange={e => setLeadData(d => ({ ...d, email: e.target.value }))}
                placeholder="voce@email.com"
                className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-3 text-sm focus:outline-none text-[#eef2ff]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1.5">WhatsApp</label>
              <input
                value={leadData.phone}
                onChange={e => setLeadData(d => ({ ...d, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
                className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-3 text-sm focus:outline-none text-[#eef2ff]"
              />
            </div>
            <p className="text-[11px] text-[#4e6a90]">
              🔒 Seus dados estão seguros.
            </p>
            <button
              onClick={submitLead}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-xl text-sm"
            >
              Ver meu diagnóstico →
            </button>
          </div>
        )}

        {currentBlock.type === 'offer' && (
          <button
            onClick={handleCTAClick}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-xl text-sm mb-6"
          >
            Quero meu plano agora →
          </button>
        )}

        {!['question', 'capture', 'offer'].includes(currentBlock.type) && (
          <button
            onClick={goNext}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-xl text-sm"
          >
            Continuar →
          </button>
        )}

        {quiz.settings?.watermark && (
          <p className="text-center text-[10px] text-[#4e6a90] mt-6">
            feito com <span className="text-blue-400">QuizAI</span>
          </p>
        )}
      </div>
    </div>
  )
}