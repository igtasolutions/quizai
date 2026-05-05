'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface Theme {
  bg: string
  surface: string
  border: string
  accent: string
  accent2: string
  text: string
  muted: string
}

interface QuizBlock {
  id: string
  type: string
  label: string
  title: string
  subtitle: string
  options: string[]
  fontFamily?: string
  fontSize?: string
  titleColor?: string
  imageUrl?: string
  imageAlt?: string
  videoProvider?: string
  videoUrl?: string
  videoEmbed?: string
  videoLockSeconds?: number
  videoLockAction?: string
  testimonialPhoto?: string
  testimonialName?: string
  testimonialRole?: string
  testimonialText?: string
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
  theme?: Theme
}

interface LeadAnswer {
  step: number
  option: string
  text: string
  time_spent_ms: number
}

const DEFAULT_THEME: Theme = {
  bg: '#05090f', surface: '#0a1120', border: '#162035',
  accent: '#2563ff', accent2: '#60a5fa', text: '#eef2ff', muted: '#4e6a90',
}

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return match ? match[1] : null
}

function getVimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

function VideoBlock({ block, theme, onUnlock }: { block: QuizBlock; theme: Theme; onUnlock: () => void }) {
  const lockSeconds = block.videoLockSeconds ?? 0
  const [unlocked, setUnlocked] = useState(lockSeconds === 0)
  const [secondsWatched, setSecondsWatched] = useState(0)
  const intervalRef = useRef<any>(null)

  useEffect(() => {
    if (unlocked || lockSeconds === 0) return

    const start = () => {
      if (intervalRef.current) return
      intervalRef.current = setInterval(() => {
        setSecondsWatched(s => {
          const next = s + 1
          if (next >= lockSeconds) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
            setUnlocked(true)
            if (block.videoLockAction === 'auto_next') onUnlock()
            return next
          }
          return next
        })
      }, 1000)
    }

    const stop = () => {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Para quando perde foco, continua quando volta
    window.addEventListener('blur', stop)
    window.addEventListener('focus', start)

    // Começa imediatamente
    start()

    return () => {
      stop()
      window.removeEventListener('blur', stop)
      window.removeEventListener('focus', start)
    }
  }, [unlocked])

  const renderPlayer = () => {
    if (block.videoProvider === 'vturb' && block.videoEmbed) {
      return <div dangerouslySetInnerHTML={{ __html: block.videoEmbed }} style={{ width: '100%' }}/>
    }

    if (block.videoProvider === 'youtube' && block.videoUrl) {
      const vid = getYouTubeId(block.videoUrl)
      if (!vid) return null
      return (
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1&showinfo=0`}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '10px' }}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
          {/* Bloqueia clique no título e logo */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', zIndex: 10 }}/>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: '80px', height: '50px', zIndex: 10 }}/>
        </div>
      )
    }

    if (block.videoProvider === 'vimeo' && block.videoUrl) {
      const vid = getVimeoId(block.videoUrl)
      if (!vid) return null
      return (
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
          <iframe src={`https://player.vimeo.com/video/${vid}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '10px' }} allowFullScreen/>
        </div>
      )
    }

    if (block.videoUrl) {
      return (
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
          <iframe src={block.videoUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '10px' }} allowFullScreen/>
        </div>
      )
    }

    return (
      <div style={{ background: `${theme.surface}`, border: `1px dashed ${theme.border}`, borderRadius: '10px', padding: '40px', textAlign: 'center', color: theme.muted, fontSize: '13px' }}>
        Configure o vídeo no editor →
      </div>
    )
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${theme.border}`, boxShadow: `0 0 20px ${theme.accent}10` }}>
        {renderPlayer()}
      </div>
    </div>
  )
}

export default function QuizPlayer({ quiz }: { quiz: Quiz }) {
  const theme: Theme = { ...DEFAULT_THEME, ...(quiz.theme ?? {}) }

  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<LeadAnswer[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [leadData, setLeadData] = useState({ name: '', email: '', phone: '' })
  const [stepStartTime, setStepStartTime] = useState(Date.now())
  const [animating, setAnimating] = useState(false)
  const [videoUnlocked, setVideoUnlocked] = useState(false)

  const blocks = quiz.blocks as QuizBlock[]
  const currentBlock = blocks[currentStep]
  const totalSteps = blocks.length
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100)
  const videoLocked = currentBlock?.type === 'video' && (currentBlock.videoLockSeconds ?? 0) > 0 && !videoUnlocked

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
    setVideoUnlocked(false)
  }, [currentStep])

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setAnimating(true)
      setTimeout(() => { setCurrentStep(s => s + 1); setAnimating(false) }, 200)
    }
  }, [currentStep, totalSteps])

  const selectOption = async (option: string, index: number) => {
    setSelectedOption(option)
    const answer: LeadAnswer = {
      step: currentStep, option: String.fromCharCode(65 + index),
      text: option, time_spent_ms: Date.now() - stepStartTime,
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

  const renderTitle = (text: string, color?: string, fontFamily?: string, fontSize?: string) => {
    const parts = text.split(/\*([^*]+)\*/)
    return (
      <h1 style={{
        fontSize: fontSize || 'clamp(20px, 5vw, 28px)',
        fontWeight: '800', lineHeight: '1.25', marginBottom: '12px',
        letterSpacing: '-0.5px', fontFamily: fontFamily || 'Syne, sans-serif',
        color: color || theme.text,
      }}>
        {parts.map((part, i) =>
          i % 2 === 1
            ? <span key={i} className="shimmer-text">{part}</span>
            : <span key={i}>{part}</span>
        )}
      </h1>
    )
  }

  if (!currentBlock) return null

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, ${theme.accent2} 0%, #ffffff 40%, ${theme.accent2} 60%, ${theme.accent} 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 2.5s linear infinite;
          font-weight: inherit;
        }
        .glow-card::before {
          content: '';
          position: absolute;
          top: -50px; right: -50px;
          width: 180px; height: 180px;
          background: radial-gradient(circle, ${theme.accent}18 0%, transparent 70%);
          pointer-events: none;
          animation: glow-pulse 3s ease-in-out infinite;
        }
        .glow-card::after {
          content: '';
          position: absolute;
          bottom: -30px; left: -30px;
          width: 120px; height: 120px;
          background: radial-gradient(circle, ${theme.accent2}10 0%, transparent 70%);
          pointer-events: none;
        }
        .opt-btn { transition: all 0.2s ease; }
        .opt-btn:hover {
          border-color: ${theme.accent}80 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px ${theme.accent}20 !important;
        }
      `}</style>

      {/* BARRA DE PROGRESSO */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: `${theme.surface}f7`, borderBottom: `1px solid ${theme.border}`, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '-1px', fontFamily: 'Syne, sans-serif', color: theme.text }}>
            Quiz<span style={{ color: theme.accent2 }}>AI</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: '3px', background: `${theme.border}`, borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`, borderRadius: '2px', width: `${progress}%`, transition: 'width 0.5s ease' }}/>
            </div>
            <div style={{ fontSize: '10px', color: theme.muted, marginTop: '3px', textAlign: 'right' }}>
              {currentStep + 1} de {totalSteps}
            </div>
          </div>
          <div style={{ fontSize: '11px', color: theme.muted, fontWeight: '600', fontFamily: 'Syne, sans-serif' }}>
            {String(currentStep + 1).padStart(2,'0')}/{String(totalSteps).padStart(2,'0')}
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 20px 80px', opacity: animating ? 0 : 1, transition: 'opacity 0.2s ease' }}>

        <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '400px', background: `radial-gradient(ellipse, ${theme.accent}08 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }}/>

        {/* TAG */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '10px', letterSpacing: '1.5px', color: theme.accent2, textTransform: 'uppercase', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.accent2, boxShadow: `0 0 10px ${theme.accent2}` }}/>
          {currentBlock.label}
        </div>

        {/* CARD COM GLOW */}
        <div className="glow-card" style={{ background: `${theme.surface}b0`, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '24px', marginBottom: '20px', position: 'relative', zIndex: 1, overflow: 'hidden', boxShadow: `0 0 40px ${theme.accent}08` }}>
          {renderTitle(currentBlock.title, currentBlock.titleColor, currentBlock.fontFamily, currentBlock.fontSize)}
          {currentBlock.subtitle && (
            <p style={{ fontSize: '14px', color: theme.muted, lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>
              {currentBlock.subtitle}
            </p>
          )}
          {currentBlock.imageUrl && (
            <div style={{ marginTop: '16px', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${theme.border}` }}>
              <img src={currentBlock.imageUrl} alt={currentBlock.imageAlt || ''} style={{ width: '100%', display: 'block', maxHeight: '300px', objectFit: 'cover' }}/>
            </div>
          )}
        </div>

        {/* VÍDEO */}
        {(currentBlock.type === 'video' || currentBlock.videoUrl || currentBlock.videoEmbed) && (
          <div style={{ position: 'relative', zIndex: 1 }}>
            <VideoBlock block={currentBlock} theme={theme} onUnlock={() => { setVideoUnlocked(true); if (currentBlock.videoLockAction === 'auto_next') goNext() }}/>
          </div>
        )}

        {/* PROVA SOCIAL */}
        {currentBlock.testimonialName && (
          <div style={{ background: `${theme.surface}cc`, border: `1px solid ${theme.border}`, borderRadius: '14px', padding: '18px', marginBottom: '20px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: `radial-gradient(circle, #22c55e15 0%, transparent 70%)`, pointerEvents: 'none' }}/>
            {currentBlock.testimonialText && (
              <p style={{ fontSize: '14px', color: theme.text, lineHeight: '1.6', marginBottom: '14px', fontStyle: 'italic' }}>
                "{currentBlock.testimonialText}"
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {currentBlock.testimonialPhoto ? (
                <img src={currentBlock.testimonialPhoto} alt={currentBlock.testimonialName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${theme.accent}50` }}/>
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${theme.accent}, #7c3aed)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', color: '#fff' }}>
                  {currentBlock.testimonialName[0].toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>{currentBlock.testimonialName}</div>
                {currentBlock.testimonialRole && <div style={{ fontSize: '11px', color: theme.muted }}>{currentBlock.testimonialRole}</div>}
              </div>
            </div>
          </div>
        )}

        {/* OPÇÕES */}
        {currentBlock.type === 'question' && currentBlock.options.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
            {currentBlock.options.map((opt, i) => (
              <button key={i} onClick={() => selectOption(opt, i)} className="opt-btn" style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px',
                borderRadius: '12px', border: `1.5px solid ${selectedOption === opt ? theme.accent : theme.border}`,
                background: selectedOption === opt ? `${theme.accent}18` : `${theme.surface}cc`,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                boxShadow: selectedOption === opt ? `0 0 20px ${theme.accent}25` : 'none',
              }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  border: `1.5px solid ${selectedOption === opt ? theme.accent : theme.muted}`,
                  background: selectedOption === opt ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '700', flexShrink: 0, marginTop: '1px',
                  color: selectedOption === opt ? '#fff' : theme.muted, transition: 'all 0.2s',
                  boxShadow: selectedOption === opt ? `0 0 12px ${theme.accent}50` : 'none',
                }}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span style={{ fontSize: '14px', color: theme.text, lineHeight: '1.5', paddingTop: '3px' }}>{opt}</span>
              </button>
            ))}
          </div>
        )}

        {/* CAPTURA */}
        {currentBlock.type === 'capture' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
            {['name','email','phone'].map((field) => {
              const labels: any = { name: 'Nome', email: 'E-mail', phone: 'WhatsApp' }
              const placeholders: any = { name: 'Seu nome', email: 'voce@email.com', phone: '(11) 99999-9999' }
              return (
                <div key={field}>
                  <div style={{ fontSize: '10px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{labels[field]}</div>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={(leadData as any)[field]}
                    onChange={e => setLeadData(d => ({...d, [field]: e.target.value}))}
                    placeholder={placeholders[field]}
                    style={{ width: '100%', background: `${theme.surface}80`, border: `1px solid ${theme.border}`, borderRadius: '10px', color: theme.text, fontSize: '14px', padding: '13px 14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              )
            })}
            <div style={{ fontSize: '11px', color: theme.muted }}>🔒 Seus dados estão seguros.</div>
            <button onClick={submitLead} style={{ width: '100%', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '15px', padding: '16px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: `0 0 28px ${theme.accent}40` }}>
              Ver meu diagnóstico →
            </button>
          </div>
        )}

        {/* OFERTA */}
        {currentBlock.type === 'offer' && (
          <button onClick={handleCTAClick} style={{ width: '100%', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '15px', padding: '16px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: `0 0 28px ${theme.accent}40`, marginBottom: '24px', position: 'relative', zIndex: 1 }}>
            Quero meu plano agora →
          </button>
        )}

        {/* CTA PADRÃO */}
        {!['question','capture','offer'].includes(currentBlock.type) && !videoLocked && (
          <button onClick={goNext} style={{ width: '100%', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '15px', padding: '16px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: `0 0 28px ${theme.accent}40`, position: 'relative', zIndex: 1 }}>
            Continuar →
          </button>
        )}

        {quiz.settings?.watermark && (
          <p style={{ textAlign: 'center', fontSize: '11px', color: theme.muted, marginTop: '24px' }}>
            feito com <span style={{ color: theme.accent2 }}>QuizAI</span>
          </p>
        )}
      </div>
    </div>
  )
}