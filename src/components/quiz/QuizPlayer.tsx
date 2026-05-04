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
  const [animating, setAnimating] = useState(false)

  const blocks = quiz.blocks as QuizBlock[]
  const currentBlock = blocks[currentStep]
  const totalSteps = blocks.length
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100)

  const track = useCallback(async (event_type: string, step?: number, metadata?: object) => {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quiz_id: quiz.id, lead_id: leadId, session_id: sessionId,
        event_type, step: step ?? currentStep, metadata,
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      }),
    })
  }, [quiz.id, leadId, sessionId, currentStep])

  useEffect(() => { track('quiz_start', 0) }, [])

  useEffect(() => {
    track('step_view', currentStep)
    setStepStartTime(Date.now())
    setSelectedOption(null)
  }, [currentStep])

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setAnimating(true)
      setTimeout(() => {
        setCurrentStep(s => s + 1)
        setAnimating(false)
      }, 200)
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
    setTimeout(() => goNext(), 400)
  }

  const submitLead = async () => {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quiz_id: quiz.id, user_id: quiz.user_id, ...leadData,
        answers, step_reached: currentStep, total_steps: totalSteps,
        session_id: sessionId,
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      }),
    })
    const { lead } = await res.json()
    if (lead) {
      setLeadId(lead.id)
      if (quiz.pixel_id && (window as any).fbq) (window as any).fbq('track', 'Lead')
      goNext()
    }
  }

  const handleCTAClick = () => {
    track('cta_click', currentStep)
    if (quiz.pixel_id && (window as any).fbq) (window as any).fbq('track', 'InitiateCheckout')
    const checkoutUrl = quiz.product?.checkout_url
    if (checkoutUrl) window.open(checkoutUrl, '_blank')
  }

  const renderTitle = (text: string) => {
    const parts = text.split(/\*([^*]+)\*/)
    return parts.map((part, i) =>
      i % 2 === 1
        ? <span key={i} style={{ color: '#60a5fa', position: 'relative' }}>{part}</span>
        : <span key={i}>{part}</span>
    )
  }

  if (!currentBlock) return null

  return (
    <div style={{ minHeight: '100vh', background: '#05090f', color: '#eef2ff', fontFamily: 'DM Sans, sans-serif' }}>

      {/* BARRA DE PROGRESSO */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,17,32,0.95)', borderBottom: '1px solid #162035', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '-1px', fontFamily: 'Syne, sans-serif' }}>
            Quiz<span style={{ color: '#60a5fa' }}>AI</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #2563ff, #60a5fa)', borderRadius: '2px', width: `${progress}%`, transition: 'width 0.5s ease' }}/>
            </div>
            <div style={{ fontSize: '10px', color: '#4e6a90', marginTop: '3px', textAlign: 'right' }}>
              {currentStep + 1} de {totalSteps}
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#4e6a90', fontWeight: '600', fontFamily: 'Syne, sans-serif' }}>
            {String(currentStep + 1).padStart(2,'0')}/{String(totalSteps).padStart(2,'0')}
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 20px 80px', opacity: animating ? 0 : 1, transition: 'opacity 0.2s ease' }}>

        {/* GLOW */}
        <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '300px', background: 'radial-gradient(ellipse, rgba(37,99,255,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }}/>

        {/* TAG */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '10px', letterSpacing: '1.5px', color: '#60a5fa', textTransform: 'uppercase', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }}/>
          {currentBlock.label}
        </div>

        {/* TÍTULO */}
        <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: '800', lineHeight: '1.25', marginBottom: '12px', letterSpacing: '-0.5px', fontFamily: 'Syne, sans-serif', position: 'relative', zIndex: 1 }}>
          {renderTitle(currentBlock.title)}
        </h1>

        {currentBlock.subtitle && (
          <p style={{ fontSize: '14px', color: '#4e6a90', lineHeight: '1.6', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
            {currentBlock.subtitle}
          </p>
        )}

        {/* OPÇÕES */}
        {currentBlock.type === 'question' && currentBlock.options.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
            {currentBlock.options.map((opt, i) => (
              <button key={i} onClick={() => selectOption(opt, i)} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '14px 16px', borderRadius: '12px', border: `1.5px solid ${selectedOption === opt ? '#2563ff' : '#162035'}`,
                background: selectedOption === opt ? 'rgba(37,99,255,0.1)' : '#0d1829',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                boxShadow: selectedOption === opt ? '0 0 20px rgba(37,99,255,0.15)' : 'none',
              }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  border: `1.5px solid ${selectedOption === opt ? '#2563ff' : '#4e6a90'}`,
                  background: selectedOption === opt ? '#2563ff' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '700', flexShrink: 0, marginTop: '1px',
                  color: selectedOption === opt ? '#fff' : '#4e6a90',
                  boxShadow: selectedOption === opt ? '0 0 12px rgba(37,99,255,0.4)' : 'none',
                  transition: 'all 0.2s',
                }}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span style={{ fontSize: '14px', color: '#eef2ff', lineHeight: '1.5', paddingTop: '3px' }}>{opt}</span>
              </button>
            ))}
          </div>
        )}

        {/* CAPTURA */}
        {currentBlock.type === 'capture' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
            {['name', 'email', 'phone'].map((field) => {
              const labels: any = { name: 'Nome', email: 'E-mail', phone: 'WhatsApp' }
              const placeholders: any = { name: 'Seu nome', email: 'voce@email.com', phone: '(11) 99999-9999' }
              return (
                <div key={field}>
                  <div style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{labels[field]}</div>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={(leadData as any)[field]}
                    onChange={e => setLeadData(d => ({...d, [field]: e.target.value}))}
                    placeholder={placeholders[field]}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #162035', borderRadius: '10px', color: '#eef2ff', fontSize: '14px', padding: '13px 14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              )
            })}
            <div style={{ fontSize: '11px', color: '#4e6a90', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🔒 Seus dados estão seguros. Não compartilhamos com ninguém.
            </div>
            <button onClick={submitLead} style={{ width: '100%', background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '15px', padding: '16px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 0 28px rgba(37,99,255,0.4)', letterSpacing: '-0.2px' }}>
              Ver meu diagnóstico →
            </button>
          </div>
        )}

        {/* OFERTA */}
        {currentBlock.type === 'offer' && (
          <button onClick={handleCTAClick} style={{ width: '100%', background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '15px', padding: '16px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 0 28px rgba(37,99,255,0.4)', marginBottom: '24px', letterSpacing: '-0.2px', position: 'relative', zIndex: 1 }}>
            Quero meu plano agora →
          </button>
        )}

        {/* CTA PADRÃO */}
        {!['question', 'capture', 'offer'].includes(currentBlock.type) && (
          <button onClick={goNext} style={{ width: '100%', background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '15px', padding: '16px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 0 28px rgba(37,99,255,0.4)', letterSpacing: '-0.2px', position: 'relative', zIndex: 1 }}>
            Continuar →
          </button>
        )}

        {/* WATERMARK */}
        {quiz.settings?.watermark && (
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#4e6a90', marginTop: '24px' }}>
            feito com <span style={{ color: '#60a5fa' }}>QuizAI</span>
          </p>
        )}
      </div>
    </div>
  )
}