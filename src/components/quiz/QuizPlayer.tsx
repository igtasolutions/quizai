'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface Theme {
  bg: string; surface: string; border: string
  accent: string; accent2: string; text: string; muted: string
}

interface RichSection {
  id: string; badge?: string; number?: string; numberLabel?: string
  title?: string; text?: string; listType?: string; items?: string[]
  buttonEnabled?: boolean; buttonText?: string; buttonUrl?: string
  images?: string[]; stars?: number
  testimonialPhoto?: string; testimonialName?: string; testimonialRole?: string; testimonialText?: string
}

interface QuizBlock {
  id: string; type: string; label: string; title: string; subtitle: string; options: string[]
  fontFamily?: string; fontSize?: string; titleColor?: string; titleBold?: boolean; titleItalic?: boolean; titleUnderline?: boolean
  subtitleFontFamily?: string; subtitleFontSize?: string; subtitleColor?: string; subtitleBold?: boolean; subtitleItalic?: boolean; subtitleUnderline?: boolean
  imageUrl?: string; imageAlt?: string; galleryImages?: string[]
  videoProvider?: string; videoUrl?: string; videoEmbed?: string
  videoLockSeconds?: number; videoLockAction?: string
  videoDuration?: number; videoPitchSecond?: number
  testimonialPhoto?: string; testimonialName?: string; testimonialRole?: string; testimonialText?: string; testimonialStars?: number
  sections?: RichSection[]
}

interface Quiz {
  id: string; user_id: string; title: string; slug: string
  blocks: QuizBlock[]; pixel_id: string | null; product: any; settings: any; theme?: Theme
}

interface LeadAnswer {
  step: number; option: string; text: string; time_spent_ms: number
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

function StarRating({ stars }: { stars: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: '16px', color: i <= stars ? '#fbbf24' : '#4e6a90' }}>★</span>
      ))}
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
  const [showContinue, setShowContinue] = useState(false)

  const timerRef = useRef<any>(null)
  const countRef = useRef(0)
  const videoSecondsRef = useRef<Record<string, number>>({})
  const leadIdRef = useRef<string | null>(null)

  const blocks = quiz.blocks as QuizBlock[]
  const currentBlock = blocks[currentStep]
  const totalSteps = blocks.length
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100)

  const isVideoBlock = currentBlock?.type === 'video'
  // Bloco rico pode ter vídeo dentro
  const hasVideo = isVideoBlock || (currentBlock?.type === 'rich' && !!currentBlock?.videoUrl)
  const videoLockSeconds = hasVideo ? (currentBlock.videoLockSeconds ?? 0) : 0
  const needsLock = videoLockSeconds > 0

  const track = useCallback(async (event_type: string, step?: number, metadata?: object) => {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quiz_id: quiz.id, lead_id: leadIdRef.current, session_id: sessionId,
        event_type, step: step ?? currentStep, metadata,
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      }),
    })
  }, [quiz.id, sessionId, currentStep])

  const saveVideoSeconds = useCallback(async () => {
    if (Object.keys(videoSecondsRef.current).length === 0) return
    await fetch(`/api/leads`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead_id: leadIdRef.current,
        session_id: sessionId,
        video_seconds_watched: videoSecondsRef.current,
      }),
    })
  }, [sessionId])

  useEffect(() => { track('quiz_start', 0) }, [])

  useEffect(() => {
    track('step_view', currentStep)
    setStepStartTime(Date.now())
    setSelectedOption(null)
    clearInterval(timerRef.current)
    countRef.current = 0
    setShowContinue(!needsLock)
  }, [currentStep])

  useEffect(() => {
    const handleUnload = () => saveVideoSeconds()
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [saveVideoSeconds])

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setAnimating(true)
      setTimeout(() => { setCurrentStep(s => s + 1); setAnimating(false) }, 200)
    }
  }, [currentStep, totalSteps])

  // Timer do vídeo — analytics + lock
  useEffect(() => {
    if (!hasVideo) return

    const blockId = currentBlock?.id ?? ''

    const startTimer = () => {
      if (timerRef.current) return
      timerRef.current = setInterval(() => {
        countRef.current++
        videoSecondsRef.current[blockId] = (videoSecondsRef.current[blockId] ?? 0) + 1
        if (needsLock && countRef.current >= videoLockSeconds) {
          clearInterval(timerRef.current)
          timerRef.current = null
          setShowContinue(true)
          if (currentBlock?.videoLockAction === 'auto_next') goNext()
        }
      }, 1000)
    }

    const stopTimer = () => {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (currentBlock?.videoProvider === 'youtube' && currentBlock?.videoUrl) {
      const setupYT = () => {
        const iframeId = `yt-${currentBlock.id}`
        const iframe = document.getElementById(iframeId)
        if (!iframe) return
        new (window as any).YT.Player(iframeId, {
          events: {
            onStateChange: (e: any) => {
              if (e.data === 1) startTimer()
              else stopTimer()
            },
          },
        })
      }

      if ((window as any).YT?.Player) {
        setTimeout(setupYT, 800)
      } else {
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          const tag = document.createElement('script')
          tag.src = 'https://www.youtube.com/iframe_api'
          document.head.appendChild(tag)
        }
        ;(window as any).onYouTubeIframeAPIReady = () => setTimeout(setupYT, 500)
      }
    } else {
      window.addEventListener('focus', startTimer)
      window.addEventListener('blur', stopTimer)
      startTimer()
      return () => {
        stopTimer()
        window.removeEventListener('focus', startTimer)
        window.removeEventListener('blur', stopTimer)
      }
    }

    return () => stopTimer()
  }, [hasVideo, needsLock, videoLockSeconds, currentStep])

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
      leadIdRef.current = lead.id
      setLeadId(lead.id)
      if (quiz.pixel_id && (window as any).fbq) (window as any).fbq('track', 'Lead')
      goNext()
    }
  }

  const handleCTAClick = () => {
    track('cta_click', currentStep)
    saveVideoSeconds()
    if (quiz.pixel_id && (window as any).fbq) (window as any).fbq('track', 'InitiateCheckout')
    const checkoutUrl = quiz.product?.checkout_url
    if (checkoutUrl) window.open(checkoutUrl, '_blank')
  }

  const renderTitle = (text: string, block: QuizBlock) => {
    const parts = text.split(/\*([^*]+)\*/)
    return (
      <h1 style={{
        fontSize: block.fontSize || 'clamp(20px, 5vw, 28px)',
        fontWeight: block.titleBold !== false ? '800' : '400',
        fontStyle: block.titleItalic ? 'italic' : 'normal',
        textDecoration: block.titleUnderline ? 'underline' : 'none',
        lineHeight: '1.25', marginBottom: '12px', letterSpacing: '-0.5px',
        fontFamily: block.fontFamily || 'Syne, sans-serif',
        color: block.titleColor || theme.text,
      }}>
        {parts.map((part, i) => i % 2 === 1 ? <span key={i} className="shimmer-text">{part}</span> : <span key={i}>{part}</span>)}
      </h1>
    )
  }

  const renderVideo = (block: QuizBlock) => {
    if (block.videoProvider === 'vturb' && block.videoEmbed) {
      return <div dangerouslySetInnerHTML={{ __html: block.videoEmbed }} style={{ width: '100%' }}/>
    }
    if (block.videoProvider === 'youtube' && block.videoUrl) {
      const vid = getYouTubeId(block.videoUrl)
      if (!vid) return null
      return (
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
          <iframe id={`yt-${block.id}`} src={`https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1&showinfo=0&enablejsapi=1&controls=0`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '10px' }} allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"/>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', zIndex: 10 }}/>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: '80px', height: '50px', zIndex: 10 }}/>
        </div>
      )
    }
    if (block.videoProvider === 'vimeo' && block.videoUrl) {
      const vid = getVimeoId(block.videoUrl)
      if (!vid) return null
      return <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}><iframe src={`https://player.vimeo.com/video/${vid}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '10px' }} allowFullScreen/></div>
    }
    if (block.videoUrl) {
      return <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}><iframe src={block.videoUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '10px' }} allowFullScreen/></div>
    }
    return null
  }

  const renderSection = (section: RichSection) => (
    <div key={section.id} style={{ background: `${theme.surface}cc`, border: `1px solid ${theme.border}`, borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: `radial-gradient(circle, ${theme.accent}10 0%, transparent 70%)`, pointerEvents: 'none' }}/>

      {section.badge && <div style={{ display: 'inline-block', background: `${theme.accent}20`, border: `1px solid ${theme.accent}40`, color: theme.accent2, fontSize: '9px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>{section.badge}</div>}

      {section.number && (
        <div style={{ marginBottom: '4px' }}>
          {section.numberLabel && <div style={{ fontSize: '9px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>{section.numberLabel}</div>}
          <div style={{ fontSize: '48px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: theme.border, lineHeight: 1 }}>{section.number}</div>
        </div>
      )}

      {section.title && <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: theme.text, marginBottom: '8px', lineHeight: '1.3' }}>{section.title}</div>}

      {section.text && <p style={{ fontSize: '13px', color: theme.muted, lineHeight: '1.6', marginBottom: '10px', whiteSpace: 'pre-line' }}>{section.text}</p>}

      {section.listType && section.listType !== 'none' && section.items && section.items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
          {section.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: section.listType === 'check' ? '#22c55e' : '#f87171', fontWeight: '700', fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>{section.listType === 'check' ? '✓' : '✕'}</span>
              <span style={{ fontSize: '13px', color: theme.text, lineHeight: '1.5' }}>{item}</span>
            </div>
          ))}
        </div>
      )}

      {/* Galeria de imagens da seção */}
      {section.images && section.images.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
          {section.images.map((img, i) => (
            <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', border: `1px solid ${theme.border}` }}>
              <img src={img} alt="" style={{ width: '100%', display: 'block', maxHeight: '250px', objectFit: 'cover' }}/>
            </div>
          ))}
        </div>
      )}

      {/* Prova social da seção */}
      {section.testimonialName && (
        <div style={{ background: `${theme.surface}80`, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
          {section.stars && section.stars > 0 && <StarRating stars={section.stars}/>}
          {section.testimonialText && <p style={{ fontSize: '13px', color: theme.text, lineHeight: '1.6', marginBottom: '10px', fontStyle: 'italic' }}>"{section.testimonialText}"</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {section.testimonialPhoto ? (
              <img src={section.testimonialPhoto} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${theme.accent}50` }}/>
            ) : (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${theme.accent}, #7c3aed)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', color: '#fff' }}>
                {section.testimonialName[0].toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: theme.text }}>{section.testimonialName}</div>
              {section.testimonialRole && <div style={{ fontSize: '10px', color: theme.muted }}>{section.testimonialRole}</div>}
            </div>
          </div>
        </div>
      )}

      {section.buttonEnabled && section.buttonText && (
        <button onClick={() => { if (section.buttonUrl) window.open(section.buttonUrl, '_blank') }} style={{ width: '100%', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '14px', padding: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: `0 0 20px ${theme.accent}40` }}>
          {section.buttonText}
        </button>
      )}
    </div>
  )

  if (!currentBlock) return null
  const showCTAButton = !['question', 'capture', 'offer'].includes(currentBlock.type) && showContinue

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes glow-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.9; } }
        .shimmer-text { background: linear-gradient(90deg, ${theme.accent2} 0%, #ffffff 40%, ${theme.accent2} 60%, ${theme.accent} 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 2.5s linear infinite; font-weight: inherit; }
        .glow-card { position: relative; overflow: hidden; }
        .glow-card::before { content: ''; position: absolute; top: -50px; right: -50px; width: 180px; height: 180px; background: radial-gradient(circle, ${theme.accent}18 0%, transparent 70%); pointer-events: none; animation: glow-pulse 3s ease-in-out infinite; }
        .opt-btn { transition: all 0.2s ease; }
        .opt-btn:hover { border-color: ${theme.accent}80 !important; transform: translateY(-1px); }
      `}</style>

      {/* PROGRESS BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: `${theme.surface}f7`, borderBottom: `1px solid ${theme.border}`, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '-1px', fontFamily: 'Syne, sans-serif', color: theme.text }}>Quiz<span style={{ color: theme.accent2 }}>AI</span></div>
          <div style={{ flex: 1 }}>
            <div style={{ height: '3px', background: theme.border, borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`, borderRadius: '2px', width: `${progress}%`, transition: 'width 0.5s ease' }}/>
            </div>
            <div style={{ fontSize: '10px', color: theme.muted, marginTop: '3px', textAlign: 'right' }}>{currentStep + 1} de {totalSteps}</div>
          </div>
          <div style={{ fontSize: '11px', color: theme.muted, fontWeight: '600', fontFamily: 'Syne, sans-serif' }}>{String(currentStep + 1).padStart(2,'0')}/{String(totalSteps).padStart(2,'0')}</div>
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 20px 80px', opacity: animating ? 0 : 1, transition: 'opacity 0.2s ease' }}>
        <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '400px', background: `radial-gradient(ellipse, ${theme.accent}08 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }}/>

        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '10px', letterSpacing: '1.5px', color: theme.accent2, textTransform: 'uppercase', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.accent2, boxShadow: `0 0 10px ${theme.accent2}` }}/>
          {currentBlock.label}
        </div>

        {/* CARD PRINCIPAL */}
        <div className="glow-card" style={{ background: `${theme.surface}b0`, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '24px', marginBottom: '20px', position: 'relative', zIndex: 1, boxShadow: `0 0 40px ${theme.accent}08` }}>
          {renderTitle(currentBlock.title, currentBlock)}
          {currentBlock.subtitle && (
            <p style={{
              fontSize: currentBlock.subtitleFontSize || '14px',
              fontFamily: currentBlock.subtitleFontFamily || 'DM Sans, sans-serif',
              color: currentBlock.subtitleColor || theme.muted,
              fontWeight: currentBlock.subtitleBold ? '700' : '400',
              fontStyle: currentBlock.subtitleItalic ? 'italic' : 'normal',
              textDecoration: currentBlock.subtitleUnderline ? 'underline' : 'none',
              lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0,
            }}>
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
        {(currentBlock.videoUrl || currentBlock.videoEmbed) && (
          <div style={{ marginBottom: '16px', position: 'relative', zIndex: 1 }}>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${theme.border}`, boxShadow: `0 0 20px ${theme.accent}10` }}>
              {renderVideo(currentBlock)}
            </div>
          </div>
        )}

        {/* GALERIA DE IMAGENS */}
        {currentBlock.galleryImages && currentBlock.galleryImages.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
            {currentBlock.galleryImages.map((img, i) => (
              <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${theme.border}` }}>
                <img src={img} alt="" style={{ width: '100%', display: 'block', maxHeight: '300px', objectFit: 'cover' }}/>
              </div>
            ))}
          </div>
        )}

        {/* SEÇÕES DO BLOCO RICO */}
        {currentBlock.sections && currentBlock.sections.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
            {currentBlock.sections.map(renderSection)}
          </div>
        )}

        {/* PROVA SOCIAL DO BLOCO */}
        {currentBlock.testimonialName && (
          <div style={{ background: `${theme.surface}cc`, border: `1px solid ${theme.border}`, borderRadius: '14px', padding: '18px', marginBottom: '20px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
            {(currentBlock as any).testimonialStars > 0 && <StarRating stars={(currentBlock as any).testimonialStars}/>}
            {currentBlock.testimonialText && <p style={{ fontSize: '14px', color: theme.text, lineHeight: '1.6', marginBottom: '14px', fontStyle: 'italic' }}>"{currentBlock.testimonialText}"</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {currentBlock.testimonialPhoto ? <img src={currentBlock.testimonialPhoto} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${theme.accent}50` }}/> : <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${theme.accent}, #7c3aed)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', color: '#fff' }}>{currentBlock.testimonialName[0].toUpperCase()}</div>}
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
              <button key={i} onClick={() => selectOption(opt, i)} className="opt-btn" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '12px', border: `1.5px solid ${selectedOption === opt ? theme.accent : theme.border}`, background: selectedOption === opt ? `${theme.accent}18` : `${theme.surface}cc`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', boxShadow: selectedOption === opt ? `0 0 20px ${theme.accent}25` : 'none' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', border: `1.5px solid ${selectedOption === opt ? theme.accent : theme.muted}`, background: selectedOption === opt ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0, marginTop: '1px', color: selectedOption === opt ? '#fff' : theme.muted, transition: 'all 0.2s' }}>{String.fromCharCode(65 + i)}</div>
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
                  <input type={field === 'email' ? 'email' : 'text'} value={(leadData as any)[field]} onChange={e => setLeadData(d => ({...d, [field]: e.target.value}))} placeholder={placeholders[field]} style={{ width: '100%', background: `${theme.surface}80`, border: `1px solid ${theme.border}`, borderRadius: '10px', color: theme.text, fontSize: '14px', padding: '13px 14px', outline: 'none', boxSizing: 'border-box' }}/>
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

        {showCTAButton && (
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