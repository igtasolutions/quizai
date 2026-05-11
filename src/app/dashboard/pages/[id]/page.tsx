'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ComponentsSidebar from '@/components/editor/ComponentsSidebar'

// ── Tipos ─────────────────────────────────────────────────────────────────
interface PricePlan { name: string; price: string; period: string; features: string[]; buttonText: string; buttonUrl: string; badge: string; highlight: boolean }
interface ImageOption { label: string; image: string }
interface FaqItem { q: string; a: string }
interface Block {
  id: string; type: string; label: string; title: string; subtitle: string; options: string[]
  imageUrl?: string; imageAlt?: string; imageOptions?: ImageOption[]
  videoUrl?: string; videoProvider?: string
  audioUrl?: string
  testimonialName?: string; testimonialRole?: string; testimonialText?: string; testimonialStars?: number
  buttonText?: string; buttonUrl?: string; buttonBg?: string; buttonColor?: string; buttonFont?: string; buttonFontSize?: string; buttonSize?: string
  meterLabel?: string; meterMax?: number
  sections?: any[]; faqItems?: FaqItem[]
  timerSeconds?: number
  alertType?: string; alertIcon?: string
  priceValue?: string; pricePeriod?: string; priceFeatures?: string[]; priceButtonText?: string; priceButtonUrl?: string
  plans?: PricePlan[]
  beforeText?: string; afterText?: string; beforeImage?: string; afterImage?: string
  htmlCode?: string; spacerHeight?: number
  notificationText?: string; notificationIcon?: string
  titleBold?: boolean; titleColor?: string; fontFamily?: string
  fieldType?: string; fieldPlaceholder?: string; fieldRequired?: boolean; weightLabel?: string; heightLabel?: string
  carouselItems?: { image?: string; title?: string; text?: string }[]
  chartLabels?: string[]; chartValues?: number[]; chartColors?: string[]
  multipleChoice?: boolean
  blockBg?: string; blockBgImage?: string; blockPadding?: string; blockFullWidth?: boolean
  [key: string]: any
}

const THEMES = [
  { name: 'Dark Azul',  bg: '#05090f', surface: '#0a1120', border: '#162035', accent: '#2563ff', accent2: '#60a5fa', text: '#eef2ff', muted: '#4e6a90' },
  { name: 'Dark Roxo',  bg: '#08050f', surface: '#120a20', border: '#1e1035', accent: '#7c3aed', accent2: '#a78bfa', text: '#f5f0ff', muted: '#6b5a90' },
  { name: 'Dark Verde', bg: '#050f09', surface: '#0a2012', border: '#163520', accent: '#059669', accent2: '#34d399', text: '#f0fff4', muted: '#4e9070' },
  { name: 'Claro',      bg: '#f8fafc', surface: '#ffffff', border: '#e2e8f0', accent: '#2563ff', accent2: '#3b82f6', text: '#0f172a', muted: '#64748b' },
]
const padMap: Record<string, string> = { none: '0', sm: '16px', md: '32px', lg: '64px', xl: '96px' }
const inp = (e?: React.CSSProperties): React.CSSProperties => ({ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #162035', borderRadius: '8px', color: '#eef2ff', fontSize: '12px', padding: '8px 10px', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'DM Sans, sans-serif', ...e })
const lbl: React.CSSProperties = { display: 'block', fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '4px' }
const ta = inp({ resize: 'vertical' as const, minHeight: '68px' })

// ── Upload helper ─────────────────────────────────────────────────────────
function Upload({ label, value, onChange }: { label: string; value: string; onChange: (u: string) => void }) {
  const [up, setUp] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const handle = async (file: File) => {
    setUp(true)
    const form = new FormData(); form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const { url } = await res.json()
    onChange(url); setUp(false)
  }
  return (
    <div>
      <label style={lbl}>{label}</label>
      <div style={{ display: 'flex', gap: '6px' }}>
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="URL ou clique em Upload" style={{ ...inp(), flex: 1 }}/>
        <button onClick={() => ref.current?.click()} disabled={up} style={{ background: 'rgba(37,99,255,0.12)', border: '1px solid rgba(37,99,255,0.3)', color: '#60a5fa', fontSize: '10px', fontWeight: '600', padding: '6px 10px', borderRadius: '7px', cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0 }}>{up ? '...' : '📤 Upload'}</button>
        <input ref={ref} type="file" accept="image/*,audio/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handle(e.target.files[0]) }}/>
      </div>
      {value && /\.(jpg|jpeg|png|gif|webp)$/i.test(value) && <img src={value} alt="" style={{ width: '100%', borderRadius: '8px', marginTop: '6px', maxHeight: '80px', objectFit: 'cover' }}/>}
    </div>
  )
}

// ── TimerBlock (client component dentro do canvas) ────────────────────────
function TimerBlock({ block, theme }: { block: Block; theme: typeof THEMES[0] }) {
  const [secs, setSecs] = useState(block.timerSeconds || 600)
  useEffect(() => { const iv = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000); return () => clearInterval(iv) }, [])
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div style={{ padding: '28px 24px', textAlign: 'center' as const }}>
      {block.title && <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
      {block.subtitle && <p style={{ fontSize: '12px', color: theme.muted, margin: '0 0 14px' }}>{block.subtitle}</p>}
      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
        {[{ v: pad(h), l: 'HORAS' }, { v: pad(m), l: 'MIN' }, { v: pad(s), l: 'SEG' }].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '10px 14px', textAlign: 'center' as const }}>
              <div style={{ fontSize: '26px', fontWeight: '700', fontFamily: 'monospace', color: theme.accent }}>{item.v}</div>
              <div style={{ fontSize: '9px', color: theme.muted }}>{item.l}</div>
            </div>
            {i < 2 && <span style={{ color: theme.muted, fontSize: '18px' }}>:</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── BlockRenderer ─────────────────────────────────────────────────────────
function BlockRenderer({ block, theme, selected, onClick, onDelete, onMoveUp, onMoveDown, isFirst, isLast }:
  { block: Block; theme: typeof THEMES[0]; selected: boolean; onClick: () => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; isFirst: boolean; isLast: boolean }) {

  const rt = (text: string) => (text || '').split(/\*([^*]+)\*/).map((p, i) => i % 2 === 1 ? <span key={i} style={{ color: theme.accent2 }}>{p}</span> : <span key={i}>{p}</span>)

  const blockBgStyle: React.CSSProperties = {
    ...(block.blockBgImage ? { backgroundImage: `url(${block.blockBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
    ...(block.blockBg && !block.blockBgImage ? { background: block.blockBg } : { background: theme.bg }),
    ...(block.blockPadding && block.blockPadding !== 'md' ? { padding: `${padMap[block.blockPadding]} 24px` } : {}),
  }

  const renderContent = (): React.ReactNode => {
    switch (block.type) {
      case 'rich':
        if (block.htmlCode) return <div style={{ padding: '16px 24px' }}><span style={{ fontSize: '11px', color: theme.muted, fontFamily: 'monospace' }}>{'</> HTML/Script'}</span></div>
        return (
          <div style={{ padding: '32px 24px' }}>
            {block.title && <h2 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: block.titleBold ? '700' : '300', fontFamily: block.fontFamily || 'Syne, sans-serif', color: block.titleColor || theme.text, margin: '0 0 12px', lineHeight: 1.15, letterSpacing: '-0.5px' }}>{rt(block.title)}</h2>}
            {block.subtitle && <p style={{ fontSize: '15px', color: theme.muted, margin: '0 0 16px', lineHeight: 1.7 }}>{block.subtitle}</p>}
            {block.sections?.map((s: any) => (
              <div key={s.id} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', display: 'flex', gap: '12px' }}>
                {s.badge && <span style={{ fontSize: '18px', flexShrink: 0 }}>{s.badge}</span>}
                <div>{s.title && <div style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '3px' }}>{s.title}</div>}{s.text && <div style={{ fontSize: '13px', color: theme.muted }}>{s.text}</div>}</div>
              </div>
            ))}
            {block.faqItems && block.faqItems.length > 0 && (
              <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '12px', overflow: 'hidden', marginTop: '8px' }}>
                {block.faqItems.map((f, i) => (
                  <div key={i} style={{ borderBottom: i < (block.faqItems?.length || 0) - 1 ? `1px solid ${theme.border}` : 'none', padding: '12px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text, marginBottom: '3px' }}>❓ {f.q}</div>
                    {f.a && <div style={{ fontSize: '12px', color: theme.muted }}>{f.a}</div>}
                  </div>
                ))}
              </div>
            )}
            {block.carouselItems && block.carouselItems.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' as const, marginTop: '10px' }}>
                {block.carouselItems.map((item, i) => (
                  <div key={i} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '12px', minWidth: '160px', flexShrink: 0 }}>
                    {item.image && <img src={item.image} alt="" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }}/>}
                    {item.title && <div style={{ fontSize: '12px', fontWeight: '600', color: theme.text }}>{item.title}</div>}
                    {item.text && <div style={{ fontSize: '11px', color: theme.muted, marginTop: '3px' }}>{item.text}</div>}
                  </div>
                ))}
              </div>
            )}
            {'beforeImage' in block && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ background: 'rgba(248,113,113,0.1)', padding: '6px 10px', fontSize: '10px', fontWeight: '700', color: '#f87171', textTransform: 'uppercase' as const }}>ANTES</div>
                  {block.beforeImage ? <img src={block.beforeImage} alt="Antes" style={{ width: '100%', height: '120px', objectFit: 'cover' }}/> : <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.muted, fontSize: '11px' }}>📷 Sem imagem</div>}
                  {block.beforeText && <div style={{ padding: '8px 10px', fontSize: '11px', color: theme.muted }}>{block.beforeText}</div>}
                </div>
                <div style={{ background: theme.surface, border: `1px solid rgba(52,211,153,0.3)`, borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ background: 'rgba(52,211,153,0.1)', padding: '6px 10px', fontSize: '10px', fontWeight: '700', color: '#34d399', textTransform: 'uppercase' as const }}>DEPOIS</div>
                  {block.afterImage ? <img src={block.afterImage} alt="Depois" style={{ width: '100%', height: '120px', objectFit: 'cover' }}/> : <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.muted, fontSize: '11px' }}>📷 Sem imagem</div>}
                  {block.afterText && <div style={{ padding: '8px 10px', fontSize: '11px', color: theme.text, fontWeight: '600' }}>{block.afterText}</div>}
                </div>
              </div>
            )}
            {block.imageUrl && !('beforeImage' in block) && <img src={block.imageUrl} alt="" style={{ width: '100%', borderRadius: '10px', marginTop: '10px' }}/>}
          </div>
        )

      case 'insight':
        if (block.notificationText) return <div style={{ padding: '14px 24px' }}><div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '10px 16px' }}><span style={{ fontSize: '18px' }}>{block.notificationIcon || '🔔'}</span><span style={{ fontSize: '13px', color: theme.text }}>{block.notificationText}</span></div></div>
        if (block.timerSeconds) return <TimerBlock block={block} theme={theme}/>
        return (
          <div style={{ padding: '16px 24px' }}>
            <div style={{ background: block.alertType === 'warning' ? 'rgba(251,191,36,0.1)' : block.alertType === 'success' ? 'rgba(34,197,94,0.1)' : block.alertType === 'error' ? 'rgba(248,113,113,0.1)' : 'rgba(37,99,255,0.1)', border: `1px solid ${block.alertType === 'warning' ? '#fbbf2466' : block.alertType === 'success' ? '#22c55e66' : block.alertType === 'error' ? '#f8717166' : '#2563ff66'}`, borderLeft: `4px solid ${block.alertType === 'warning' ? '#fbbf24' : block.alertType === 'success' ? '#22c55e' : block.alertType === 'error' ? '#f87171' : theme.accent}`, borderRadius: '10px', padding: '14px 18px' }}>
              {block.alertIcon && <div style={{ fontSize: '28px', marginBottom: '8px' }}>{block.alertIcon}</div>}
              {block.title && <div style={{ fontSize: '15px', fontWeight: '700', color: theme.text, marginBottom: '5px' }}>{block.title}</div>}
              {block.subtitle && <div style={{ fontSize: '13px', color: theme.muted }}>{block.subtitle}</div>}
            </div>
          </div>
        )

      case 'bridge':
        if (block.spacerHeight) return <div style={{ height: block.spacerHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '100%', borderTop: `1px dashed ${theme.border}` }}/></div>
        return <div style={{ padding: '20px 24px', textAlign: 'center' as const }}>{block.title && <p style={{ fontSize: '15px', color: theme.muted, fontStyle: 'italic', margin: 0 }}>{block.title}</p>}</div>

      case 'social_proof':
        return (
          <div style={{ padding: '16px 24px' }}>
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '14px', padding: '20px' }}>
              {block.testimonialStars && <div style={{ marginBottom: '10px' }}>{'★'.repeat(block.testimonialStars).split('').map((s, i) => <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>{s}</span>)}</div>}
              {block.testimonialText && <p style={{ fontSize: '14px', color: theme.text, lineHeight: 1.7, margin: '0 0 14px', fontStyle: 'italic' }}>"{block.testimonialText}"</p>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>{block.testimonialName?.[0]?.toUpperCase() || '?'}</div>
                <div><div style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>{block.testimonialName || 'Nome'}</div>{block.testimonialRole && <div style={{ fontSize: '11px', color: theme.muted }}>{block.testimonialRole}</div>}</div>
              </div>
            </div>
          </div>
        )

      case 'offer':
        if (block.plans && block.plans.length > 0) return (
          <div style={{ padding: '24px' }}>
            {block.title && <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.text, margin: '0 0 20px', fontFamily: 'Syne, sans-serif', textAlign: 'center' as const }}>{block.title}</h3>}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${block.plans.length}, 1fr)`, gap: '12px' }}>
              {block.plans.map((plan, i) => (
                <div key={i} style={{ background: theme.surface, border: `1px solid ${plan.highlight ? theme.accent : theme.border}`, borderRadius: '14px', padding: '18px', position: 'relative', boxShadow: plan.highlight ? `0 0 24px ${theme.accent}40` : 'none' }}>
                  {plan.badge && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, color: '#fff', fontSize: '9px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap' as const }}>{plan.badge}</div>}
                  {plan.name && <div style={{ fontSize: '11px', fontWeight: '700', color: theme.muted, marginBottom: '6px', textTransform: 'uppercase' as const }}>{plan.name}</div>}
                  <div style={{ fontSize: '26px', fontWeight: '300', fontFamily: 'Syne, sans-serif', color: theme.text, letterSpacing: '-1px', marginBottom: '12px' }}>{plan.price}</div>
                  {plan.features?.slice(0, 3).map((f, fi) => <div key={fi} style={{ fontSize: '11px', color: theme.muted, marginBottom: '4px' }}>✓ {f}</div>)}
                  {plan.buttonText && <div style={{ marginTop: '12px', background: plan.highlight ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` : 'transparent', border: `1px solid ${plan.highlight ? 'transparent' : theme.border}`, color: plan.highlight ? '#fff' : theme.text, textAlign: 'center' as const, padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>{plan.buttonText}</div>}
                </div>
              ))}
            </div>
          </div>
        )
        if (block.priceValue) return (
          <div style={{ padding: '24px', textAlign: 'center' as const }}>
            {block.title && <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.text, margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '20px', display: 'inline-block', textAlign: 'left' as const }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '14px' }}>
                <span style={{ fontSize: '34px', fontWeight: '300', fontFamily: 'Syne, sans-serif', color: theme.text, letterSpacing: '-1px' }}>{block.priceValue}</span>
                {block.pricePeriod && <span style={{ fontSize: '12px', color: theme.muted }}>{block.pricePeriod}</span>}
              </div>
              {block.priceFeatures?.map((f, fi) => <div key={fi} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', fontSize: '12px', color: theme.text }}><span style={{ color: theme.accent2 }}>✓</span>{f}</div>)}
              <div style={{ marginTop: '14px', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, color: '#fff', textAlign: 'center' as const, padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>{block.priceButtonText || 'Comprar'}</div>
            </div>
          </div>
        )
        return (
          <div style={{ padding: '24px', textAlign: 'center' as const }}>
            {block.title && <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
            {block.subtitle && <p style={{ fontSize: '13px', color: theme.muted, margin: '0 0 16px' }}>{block.subtitle}</p>}
            <div style={{ display: 'inline-block', background: block.buttonBg || `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, color: block.buttonColor || '#fff', padding: block.buttonSize === 'lg' ? '16px 40px' : block.buttonSize === 'sm' ? '8px 20px' : '12px 28px', borderRadius: '10px', fontSize: block.buttonFontSize || '14px', fontWeight: '700', fontFamily: block.buttonFont || 'Syne, sans-serif' }}>{block.buttonText || 'Clique aqui →'}</div>
          </div>
        )

      case 'video':
        return (
          <div style={{ padding: '16px 24px' }}>
            {block.title && <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.text, margin: '0 0 10px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '12px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {block.videoUrl ? <div style={{ textAlign: 'center', color: theme.muted }}><div style={{ fontSize: '28px', marginBottom: '6px' }}>🎥</div><div style={{ fontSize: '11px' }}>{block.videoUrl.substring(0, 36)}...</div></div>
                : <div style={{ textAlign: 'center', color: theme.muted }}><div style={{ fontSize: '36px', opacity: 0.4 }}>▶</div><div style={{ fontSize: '11px', marginTop: '6px' }}>Cole a URL no painel</div></div>}
            </div>
          </div>
        )

      case 'question':
        return (
          <div style={{ padding: '28px 24px' }}>
            {block.title && <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, margin: '0 0 16px', fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }}>{block.title}</h3>}
            {block.imageOptions && block.imageOptions.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(block.imageOptions.length, 3)}, 1fr)`, gap: '10px' }}>
                {block.imageOptions.map((opt, i) => (
                  <div key={i} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                    {opt.image ? <img src={opt.image} alt={opt.label} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }}/> : <div style={{ aspectRatio: '3/4', background: theme.border, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.muted, fontSize: '20px' }}>📷</div>}
                    <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${theme.accent}`, flexShrink: 0 }}/>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: theme.text }}>{opt.label || `Opção ${i+1}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(block.options || []).map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: `1px solid ${theme.border}`, borderRadius: '10px', background: theme.surface }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: block.multipleChoice ? '4px' : '50%', border: `1.5px solid ${theme.muted}`, flexShrink: 0 }}/>
                    <span style={{ fontSize: '13px', color: theme.text }}>{opt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'meter':
        return (
          <div style={{ padding: '24px', textAlign: 'center' as const }}>
            {block.title && <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, margin: '0 0 6px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
            {block.subtitle && <p style={{ fontSize: '12px', color: theme.muted, margin: '0 0 16px' }}>{block.subtitle}</p>}
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '10px', color: theme.muted, marginBottom: '8px', textTransform: 'uppercase' as const }}>{block.meterLabel || 'Score'}</div>
              <div style={{ height: '8px', background: theme.border, borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', width: '73%', background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`, borderRadius: '4px' }}/>
              </div>
              <div style={{ fontSize: '26px', fontWeight: '300', fontFamily: 'Syne, sans-serif', color: theme.accent }}>7/{block.meterMax || 10}</div>
            </div>
          </div>
        )

      case 'calculator':
        if (block.chartLabels && block.chartLabels.length > 0) {
          const max = Math.max(...(block.chartValues || [1]))
          return (
            <div style={{ padding: '24px' }}>
              {block.title && <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.text, margin: '0 0 6px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
              {block.subtitle && <p style={{ fontSize: '12px', color: theme.muted, margin: '0 0 16px' }}>{block.subtitle}</p>}
              <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', justifyContent: 'center' }}>
                  {(block.chartLabels || []).map((label: string, i: number) => {
                    const pct = ((block.chartValues?.[i] || 0) / max) * 100
                    const color = block.chartColors?.[i] || (i === 0 ? '#f87171' : theme.accent)
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: theme.text }}>{(block.chartValues?.[i] || 0).toLocaleString('pt-BR')}</div>
                        <div style={{ width: '100%', height: `${pct}%`, background: color, borderRadius: '6px 6px 0 0', minHeight: '8px', boxShadow: `0 0 10px ${color}60` }}/>
                        <div style={{ fontSize: '10px', color: theme.muted, textAlign: 'center' as const, lineHeight: 1.2 }}>{label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        }
        return <div style={{ padding: '20px 24px' }}>{block.title && <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.text, margin: 0, fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}</div>

      case 'field':
        return (
          <div style={{ padding: '24px' }}>
            {block.title && <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, margin: '0 0 6px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
            {block.subtitle && <p style={{ fontSize: '12px', color: theme.muted, margin: '0 0 14px' }}>{block.subtitle}</p>}
            {block.fieldType === 'height_weight' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '12px 14px', color: theme.muted, fontSize: '13px' }}>{block.heightLabel || 'Altura (cm)'}</div>
                <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '12px 14px', color: theme.muted, fontSize: '13px' }}>{block.weightLabel || 'Peso (kg)'}</div>
              </div>
            ) : <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '12px 14px', color: theme.muted, fontSize: '13px' }}>{block.fieldPlaceholder || 'Digite aqui...'}</div>}
          </div>
        )

      default:
        return <div style={{ padding: '20px 24px' }}>{block.title && <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.text, margin: 0, fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}{block.subtitle && <p style={{ fontSize: '13px', color: theme.muted, margin: '6px 0 0' }}>{block.subtitle}</p>}</div>
    }
  }

  return (
    <div style={{ position: 'relative', cursor: 'pointer', outline: selected ? `2px solid ${theme.accent}` : '2px solid transparent', outlineOffset: '2px', borderRadius: '4px', transition: 'all 0.15s', ...blockBgStyle }} onClick={onClick} className="canvas-block">
      {selected && (
        <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 10, display: 'flex', gap: '4px' }}>
          <button onClick={e => { e.stopPropagation(); onMoveUp() }} disabled={isFirst} style={{ background: 'rgba(10,17,32,0.95)', border: '1px solid #162035', color: isFirst ? '#2e4560' : '#4e6a90', borderRadius: '5px', padding: '3px 7px', cursor: isFirst ? 'default' : 'pointer', fontSize: '11px' }}>↑</button>
          <button onClick={e => { e.stopPropagation(); onMoveDown() }} disabled={isLast} style={{ background: 'rgba(10,17,32,0.95)', border: '1px solid #162035', color: isLast ? '#2e4560' : '#4e6a90', borderRadius: '5px', padding: '3px 7px', cursor: isLast ? 'default' : 'pointer', fontSize: '11px' }}>↓</button>
          <button onClick={e => { e.stopPropagation(); onDelete() }} style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', borderRadius: '5px', padding: '3px 7px', cursor: 'pointer', fontSize: '11px' }}>✕</button>
        </div>
      )}
      {renderContent()}
    </div>
  )
}

// ── BlockEditor ───────────────────────────────────────────────────────────
function BlockEditor({ block, onChange }: { block: Block; onChange: (f: string, v: any) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div><label style={lbl}>Título <span style={{ color: '#60a5fa', textTransform: 'none', letterSpacing: 0, fontSize: '9px' }}>(*palavra* = destaque)</span></label><textarea value={block.title || ''} onChange={e => onChange('title', e.target.value)} style={ta}/></div>
      {!['question','field','social_proof'].includes(block.type) && <div><label style={lbl}>Subtítulo / Texto</label><textarea value={block.subtitle || ''} onChange={e => onChange('subtitle', e.target.value)} style={ta}/></div>}

      {/* PERGUNTA */}
      {block.type === 'question' && (
        <>
          <div><label style={lbl}>Opções de texto (uma por linha)</label><textarea value={(block.options || []).join('\n')} onChange={e => onChange('options', e.target.value.split('\n').filter(Boolean))} rows={4} style={ta}/></div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ ...lbl, marginBottom: 0 }}>Opções com imagem (estilo Inlead)</label>
              <button onClick={() => onChange('imageOptions', [...(block.imageOptions || []), { label: 'Opção', image: '' }])} style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa', fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer' }}>+ Opção</button>
            </div>
            {(block.imageOptions || []).map((opt, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #0f1a2e', borderRadius: '8px', padding: '10px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                  <input value={opt.label} onChange={e => { const o = [...(block.imageOptions || [])]; o[i] = { ...o[i], label: e.target.value }; onChange('imageOptions', o) }} placeholder="Label" style={{ ...inp(), flex: 1 }}/>
                  <button onClick={() => onChange('imageOptions', (block.imageOptions || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                </div>
                <Upload label="Imagem" value={opt.image} onChange={url => { const o = [...(block.imageOptions || [])]; o[i] = { ...o[i], image: url }; onChange('imageOptions', o) }}/>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><input type="checkbox" checked={block.multipleChoice || false} onChange={e => onChange('multipleChoice', e.target.checked)}/><label style={{ ...lbl, marginBottom: 0 }}>Múltipla escolha</label></div>
        </>
      )}

      {/* BOTÃO */}
      {block.type === 'offer' && !block.priceValue && !(block.plans && block.plans.length > 0) && (
        <>
          <div><label style={lbl}>Texto do botão</label><input value={block.buttonText || ''} onChange={e => onChange('buttonText', e.target.value)} style={inp()}/></div>
          <div><label style={lbl}>URL do botão</label><input value={block.buttonUrl || ''} onChange={e => onChange('buttonUrl', e.target.value)} placeholder="https://..." style={inp()}/></div>
          <div><label style={lbl}>Tamanho</label><select value={block.buttonSize || 'md'} onChange={e => onChange('buttonSize', e.target.value)} style={inp()}><option value="sm">Pequeno</option><option value="md">Médio</option><option value="lg">Grande</option></select></div>
          <div><label style={lbl}>Fonte</label><select value={block.buttonFont || 'Syne, sans-serif'} onChange={e => onChange('buttonFont', e.target.value)} style={inp()}><option value="Syne, sans-serif">Syne</option><option value="DM Sans, sans-serif">DM Sans</option><option value="Georgia, serif">Georgia</option></select></div>
          <div><label style={lbl}>Tamanho da fonte</label><input value={block.buttonFontSize || '15px'} onChange={e => onChange('buttonFontSize', e.target.value)} placeholder="15px" style={inp()}/></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div><label style={lbl}>Cor do botão</label><input type="color" value={block.buttonBg?.match(/#[0-9a-fA-F]{6}/)?.[0] || '#2563ff'} onChange={e => onChange('buttonBg', e.target.value)} style={{ ...inp(), padding: '2px', height: '32px', cursor: 'pointer' }}/></div>
            <div><label style={lbl}>Cor do texto</label><input type="color" value={block.buttonColor || '#ffffff'} onChange={e => onChange('buttonColor', e.target.value)} style={{ ...inp(), padding: '2px', height: '32px', cursor: 'pointer' }}/></div>
          </div>
        </>
      )}

      {/* PREÇO ÚNICO */}
      {'priceValue' in block && !(block.plans && block.plans.length > 0) && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div><label style={lbl}>Preço</label><input value={block.priceValue || ''} onChange={e => onChange('priceValue', e.target.value)} placeholder="R$997" style={inp()}/></div>
            <div><label style={lbl}>Período</label><input value={block.pricePeriod || ''} onChange={e => onChange('pricePeriod', e.target.value)} placeholder="acesso vitalício" style={inp()}/></div>
          </div>
          <div><label style={lbl}>Features (uma por linha)</label><textarea value={(block.priceFeatures || []).join('\n')} onChange={e => onChange('priceFeatures', e.target.value.split('\n').filter(Boolean))} rows={4} style={ta}/></div>
          <div><label style={lbl}>Texto do botão</label><input value={block.priceButtonText || ''} onChange={e => onChange('priceButtonText', e.target.value)} style={inp()}/></div>
          <div><label style={lbl}>URL do botão</label><input value={block.priceButtonUrl || ''} onChange={e => onChange('priceButtonUrl', e.target.value)} placeholder="https://..." style={inp()}/></div>
        </>
      )}

      {/* MÚLTIPLOS PLANOS */}
      {block.type === 'offer' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ ...lbl, marginBottom: 0 }}>Múltiplos planos</label>
            <button onClick={() => onChange('plans', [...(block.plans || []), { name: 'Plano', price: 'R$97', period: '/mês', features: ['Feature 1'], buttonText: 'Começar', buttonUrl: '', badge: '', highlight: false }])} style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer' }}>+ Plano</button>
          </div>
          {(block.plans || []).map((plan, i) => (
            <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #0f1a2e', borderRadius: '8px', padding: '10px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}><input value={plan.name || ''} onChange={e => { const p = [...(block.plans || [])]; p[i] = { ...p[i], name: e.target.value }; onChange('plans', p) }} placeholder="Nome" style={{ ...inp(), flex: 1 }}/><button onClick={() => onChange('plans', (block.plans || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px' }}>✕</button></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                <input value={plan.price || ''} onChange={e => { const p = [...(block.plans || [])]; p[i] = { ...p[i], price: e.target.value }; onChange('plans', p) }} placeholder="R$97" style={inp()}/>
                <input value={plan.period || ''} onChange={e => { const p = [...(block.plans || [])]; p[i] = { ...p[i], period: e.target.value }; onChange('plans', p) }} placeholder="/mês" style={inp()}/>
              </div>
              <input value={plan.badge || ''} onChange={e => { const p = [...(block.plans || [])]; p[i] = { ...p[i], badge: e.target.value }; onChange('plans', p) }} placeholder="Badge (ex: Mais popular)" style={{ ...inp(), marginBottom: '6px' }}/>
              <textarea value={(plan.features || []).join('\n')} onChange={e => { const p = [...(block.plans || [])]; p[i] = { ...p[i], features: e.target.value.split('\n').filter(Boolean) }; onChange('plans', p) }} placeholder="Features (uma por linha)" rows={3} style={{ ...ta, marginBottom: '6px' }}/>
              <input value={plan.buttonText || ''} onChange={e => { const p = [...(block.plans || [])]; p[i] = { ...p[i], buttonText: e.target.value }; onChange('plans', p) }} placeholder="Texto do botão" style={{ ...inp(), marginBottom: '6px' }}/>
              <input value={plan.buttonUrl || ''} onChange={e => { const p = [...(block.plans || [])]; p[i] = { ...p[i], buttonUrl: e.target.value }; onChange('plans', p) }} placeholder="URL do botão" style={{ ...inp(), marginBottom: '6px' }}/>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#4e6a90', cursor: 'pointer' }}><input type="checkbox" checked={plan.highlight || false} onChange={e => { const p = [...(block.plans || [])]; p[i] = { ...p[i], highlight: e.target.checked }; onChange('plans', p) }}/>Destaque (mais popular)</label>
            </div>
          ))}
        </div>
      )}

      {/* DEPOIMENTO */}
      {block.type === 'social_proof' && (<>
        <div><label style={lbl}>Nome</label><input value={block.testimonialName || ''} onChange={e => onChange('testimonialName', e.target.value)} style={inp()}/></div>
        <div><label style={lbl}>Cargo / Resultado</label><input value={block.testimonialRole || ''} onChange={e => onChange('testimonialRole', e.target.value)} style={inp()}/></div>
        <div><label style={lbl}>Depoimento</label><textarea value={block.testimonialText || ''} onChange={e => onChange('testimonialText', e.target.value)} rows={3} style={ta}/></div>
        <div><label style={lbl}>Estrelas</label><div style={{ display: 'flex', gap: '4px' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => onChange('testimonialStars', n)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: n <= (block.testimonialStars || 5) ? '#fbbf24' : '#2e4560' }}>★</button>)}</div></div>
      </>)}

      {/* VÍDEO */}
      {block.type === 'video' && (<>
        <div><label style={lbl}>URL do vídeo</label><input value={block.videoUrl || ''} onChange={e => onChange('videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=..." style={inp()}/></div>
        <div><label style={lbl}>Plataforma</label><select value={block.videoProvider || 'youtube'} onChange={e => onChange('videoProvider', e.target.value)} style={inp()}><option value="youtube">YouTube</option><option value="vimeo">Vimeo</option><option value="vturb">VTurb</option></select></div>
      </>)}

      {/* ÁUDIO */}
      {'audioUrl' in block && <Upload label="Arquivo de áudio (MP3 ou URL)" value={block.audioUrl || ''} onChange={url => onChange('audioUrl', url)}/>}

      {/* ALERTA */}
      {block.type === 'insight' && !block.notificationText && !block.timerSeconds && (<>
        <div><label style={lbl}>Tipo</label><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>{[{ v: 'info', l: '🔵 Info' }, { v: 'warning', l: '🟡 Aviso' }, { v: 'success', l: '🟢 Sucesso' }, { v: 'error', l: '🔴 Urgente' }].map(t => <button key={t.v} onClick={() => onChange('alertType', t.v)} style={{ padding: '7px 10px', fontSize: '11px', fontWeight: '600', background: block.alertType === t.v ? 'rgba(37,99,255,0.2)' : 'rgba(0,0,0,0.3)', border: `1px solid ${block.alertType === t.v ? '#2563ff' : '#162035'}`, color: block.alertType === t.v ? '#60a5fa' : '#4e6a90', borderRadius: '7px', cursor: 'pointer' }}>{t.l}</button>)}</div></div>
        <div><label style={lbl}>Ícone</label><div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '6px' }}>{['⚠️','🚨','❗','🔥','💡','📢','✅','❌','🛑','💰','🎯','⏰','🔒','💎'].map(icon => <button key={icon} onClick={() => onChange('alertIcon', icon)} style={{ background: block.alertIcon === icon ? 'rgba(37,99,255,0.2)' : 'rgba(0,0,0,0.3)', border: `1px solid ${block.alertIcon === icon ? '#2563ff' : '#162035'}`, borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '16px' }}>{icon}</button>)}</div><input value={block.alertIcon || ''} onChange={e => onChange('alertIcon', e.target.value)} placeholder="Ou cole qualquer emoji" style={inp()}/></div>
      </>)}

      {/* FAQ */}
      {'faqItems' in block && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ ...lbl, marginBottom: 0 }}>Perguntas e Respostas</label>
            <button onClick={() => onChange('faqItems', [...(block.faqItems || []), { q: 'Pergunta?', a: 'Resposta...' }])} style={{ background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer' }}>+ Pergunta</button>
          </div>
          {(block.faqItems || []).map((faq, i) => (
            <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #0f1a2e', borderRadius: '8px', padding: '10px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}><input value={faq.q} onChange={e => { const f = [...(block.faqItems || [])]; f[i] = { ...f[i], q: e.target.value }; onChange('faqItems', f) }} placeholder="Pergunta?" style={{ ...inp(), flex: 1 }}/><button onClick={() => onChange('faqItems', (block.faqItems || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px' }}>✕</button></div>
              <textarea value={faq.a} onChange={e => { const f = [...(block.faqItems || [])]; f[i] = { ...f[i], a: e.target.value }; onChange('faqItems', f) }} placeholder="Resposta..." rows={2} style={ta}/>
            </div>
          ))}
        </div>
      )}

      {/* ANTES/DEPOIS */}
      {'beforeImage' in block && (<>
        <Upload label="Imagem ANTES" value={block.beforeImage || ''} onChange={url => onChange('beforeImage', url)}/>
        <div><label style={lbl}>Texto ANTES</label><input value={block.beforeText || ''} onChange={e => onChange('beforeText', e.target.value)} style={inp()}/></div>
        <Upload label="Imagem DEPOIS" value={block.afterImage || ''} onChange={url => onChange('afterImage', url)}/>
        <div><label style={lbl}>Texto DEPOIS</label><input value={block.afterText || ''} onChange={e => onChange('afterText', e.target.value)} style={inp()}/></div>
      </>)}

      {/* CARROSSEL */}
      {'carouselItems' in block && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ ...lbl, marginBottom: 0 }}>Slides</label>
            <button onClick={() => onChange('carouselItems', [...(block.carouselItems || []), { image: '', title: '', text: '' }])} style={{ background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer' }}>+ Slide</button>
          </div>
          {(block.carouselItems || []).map((item, i) => (
            <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #0f1a2e', borderRadius: '8px', padding: '10px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}><button onClick={() => onChange('carouselItems', (block.carouselItems || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '11px' }}>✕ Remover</button></div>
              <Upload label={`Imagem slide ${i+1}`} value={item.image || ''} onChange={url => { const c = [...(block.carouselItems || [])]; c[i] = { ...c[i], image: url }; onChange('carouselItems', c) }}/>
              <input value={item.title || ''} onChange={e => { const c = [...(block.carouselItems || [])]; c[i] = { ...c[i], title: e.target.value }; onChange('carouselItems', c) }} placeholder="Título" style={{ ...inp(), marginTop: '6px', marginBottom: '4px' }}/>
              <input value={item.text || ''} onChange={e => { const c = [...(block.carouselItems || [])]; c[i] = { ...c[i], text: e.target.value }; onChange('carouselItems', c) }} placeholder="Texto" style={inp()}/>
            </div>
          ))}
        </div>
      )}

      {/* GRÁFICO */}
      {'chartLabels' in block && (<>
        <div><label style={lbl}>Labels (uma por linha)</label><textarea value={(block.chartLabels || []).join('\n')} onChange={e => { const ls = e.target.value.split('\n'); onChange('chartLabels', ls); const vs = block.chartValues || []; while (vs.length < ls.length) vs.push(0); onChange('chartValues', vs.slice(0, ls.length)) }} rows={3} style={ta}/></div>
        <div><label style={lbl}>Valores (um por linha)</label><textarea value={(block.chartValues || []).join('\n')} onChange={e => onChange('chartValues', e.target.value.split('\n').map(Number).filter(n => !isNaN(n)))} rows={3} style={ta}/></div>
        <div><label style={lbl}>Cores hex (uma por linha)</label><textarea value={(block.chartColors || []).join('\n')} onChange={e => onChange('chartColors', e.target.value.split('\n').filter(Boolean))} placeholder="#f87171&#10;#2563ff" rows={3} style={ta}/></div>
      </>)}

      {/* MEDIDOR */}
      {block.type === 'meter' && (<>
        <div><label style={lbl}>Label</label><input value={block.meterLabel || ''} onChange={e => onChange('meterLabel', e.target.value)} style={inp()}/></div>
        <div><label style={lbl}>Máximo</label><input type="number" min={1} max={100} value={block.meterMax || 10} onChange={e => onChange('meterMax', Number(e.target.value))} style={inp()}/></div>
      </>)}

      {/* TIMER */}
      {'timerSeconds' in block && block.type === 'insight' && (
        <div><label style={lbl}>Tempo total (segundos)</label><input type="number" value={block.timerSeconds || 600} onChange={e => onChange('timerSeconds', Number(e.target.value))} style={inp()}/><div style={{ fontSize: '10px', color: '#4e6a90', marginTop: '3px' }}>{Math.floor((block.timerSeconds || 600) / 3600)}h {Math.floor(((block.timerSeconds || 600) % 3600) / 60)}m {(block.timerSeconds || 600) % 60}s</div></div>
      )}

      {/* NOTIFICAÇÃO */}
      {'notificationText' in block && (<>
        <div><label style={lbl}>Texto</label><input value={block.notificationText || ''} onChange={e => onChange('notificationText', e.target.value)} style={inp()}/></div>
        <div><label style={lbl}>Ícone</label><input value={block.notificationIcon || '🔔'} onChange={e => onChange('notificationIcon', e.target.value)} style={{ ...inp(), width: '80px' }}/></div>
      </>)}

      {/* ESPAÇO */}
      {'spacerHeight' in block && (
        <div><label style={lbl}>Altura (px) — {block.spacerHeight || 40}px</label><input type="range" min={8} max={200} value={block.spacerHeight || 40} onChange={e => onChange('spacerHeight', Number(e.target.value))} style={{ width: '100%' }}/></div>
      )}

      {/* CAMPO */}
      {block.type === 'field' && (<>
        <div><label style={lbl}>Tipo</label><select value={block.fieldType || 'text'} onChange={e => onChange('fieldType', e.target.value)} style={inp()}><option value="text">Texto</option><option value="email">E-mail</option><option value="phone">Telefone</option><option value="number">Número</option><option value="height_weight">Altura + Peso</option></select></div>
        <div><label style={lbl}>Placeholder</label><input value={block.fieldPlaceholder || ''} onChange={e => onChange('fieldPlaceholder', e.target.value)} style={inp()}/></div>
      </>)}

      {/* HTML */}
      {'htmlCode' in block && <div><label style={lbl}>Código HTML / Script</label><textarea value={block.htmlCode || ''} onChange={e => onChange('htmlCode', e.target.value)} rows={6} style={{ ...ta, fontFamily: 'monospace', fontSize: '11px' }}/></div>}

      {/* SUB-SEÇÕES (rich) */}
      {block.type === 'rich' && !('htmlCode' in block) && !('faqItems' in block) && !('carouselItems' in block) && !('beforeImage' in block) && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ ...lbl, marginBottom: 0 }}>Sub-seções</label>
            <button onClick={() => onChange('sections', [...(block.sections || []), { id: `s-${Date.now()}`, badge: '✅', title: '', text: '' }])} style={{ background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer' }}>+ Add</button>
          </div>
          {(block.sections || []).map((s: any, i: number) => (
            <div key={s.id || i} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #0f1a2e', borderRadius: '8px', padding: '8px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                <input value={s.badge || ''} onChange={e => { const ss = [...(block.sections || [])]; ss[i] = { ...ss[i], badge: e.target.value }; onChange('sections', ss) }} placeholder="emoji" style={{ ...inp(), width: '50px' }}/>
                <input value={s.title || ''} onChange={e => { const ss = [...(block.sections || [])]; ss[i] = { ...ss[i], title: e.target.value }; onChange('sections', ss) }} placeholder="Título" style={inp()}/>
                <button onClick={() => onChange('sections', (block.sections || []).filter((_: any, j: number) => j !== i))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>✕</button>
              </div>
              <input value={s.text || ''} onChange={e => { const ss = [...(block.sections || [])]; ss[i] = { ...ss[i], text: e.target.value }; onChange('sections', ss) }} placeholder="Texto" style={inp()}/>
            </div>
          ))}
        </div>
      )}

      {/* FUNDO DO BLOCO */}
      <div style={{ borderTop: '1px solid #0f1a2e', paddingTop: '10px' }}>
        <label style={lbl}>🎨 Fundo do bloco</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
          <div><label style={lbl}>Cor de fundo</label><input type="color" value={block.blockBg || '#05090f'} onChange={e => onChange('blockBg', e.target.value)} style={{ ...inp(), padding: '2px', height: '32px', cursor: 'pointer' }}/></div>
          <div><label style={lbl}>Padding</label><select value={block.blockPadding || 'md'} onChange={e => onChange('blockPadding', e.target.value)} style={inp()}><option value="none">Sem padding</option><option value="sm">Pequeno</option><option value="md">Médio</option><option value="lg">Grande</option><option value="xl">Extra</option></select></div>
        </div>
        <Upload label="Imagem de fundo (wallpaper)" value={block.blockBgImage || ''} onChange={url => onChange('blockBgImage', url)}/>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px' }}>
          <input type="checkbox" id={`fw-${block.id}`} checked={block.blockFullWidth || false} onChange={e => onChange('blockFullWidth', e.target.checked)}/>
          <label htmlFor={`fw-${block.id}`} style={{ ...lbl, marginBottom: 0 }}>Largura total</label>
        </div>
      </div>

      {/* ESTILO DO TÍTULO */}
      <div style={{ borderTop: '1px solid #0f1a2e', paddingTop: '10px' }}>
        <label style={lbl}>Estilo do título</label>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input type="color" value={block.titleColor || '#eef2ff'} onChange={e => onChange('titleColor', e.target.value)} style={{ width: '28px', height: '28px', borderRadius: '5px', border: '1px solid #162035', background: 'none', cursor: 'pointer', padding: '1px' }}/>
          <button onClick={() => onChange('titleBold', !block.titleBold)} style={{ padding: '4px 8px', fontSize: '12px', fontWeight: '800', background: block.titleBold ? 'rgba(37,99,255,0.2)' : 'rgba(0,0,0,0.3)', border: `1px solid ${block.titleBold ? '#2563ff' : '#162035'}`, color: block.titleBold ? '#60a5fa' : '#4e6a90', borderRadius: '5px', cursor: 'pointer' }}>B</button>
          <select value={block.fontFamily || 'Syne, sans-serif'} onChange={e => onChange('fontFamily', e.target.value)} style={{ ...inp(), width: 'auto', fontSize: '10px', padding: '4px 8px' }}><option value="Syne, sans-serif">Syne</option><option value="DM Sans, sans-serif">DM Sans</option><option value="Georgia, serif">Georgia</option><option value="monospace">Mono</option></select>
        </div>
      </div>
    </div>
  )
}

// ── Editor principal ──────────────────────────────────────────────────────
export default function EditarPaginaPage() {
  const { id } = useParams()
  const router = useRouter()
  const [page, setPage] = useState<any>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showThemes, setShowThemes] = useState(false)
  const [themeIdx, setThemeIdx] = useState(0)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')
  const [pageTitle, setPageTitle] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)

  const theme = THEMES[themeIdx]
  const selectedBlock = blocks.find(b => b.id === selectedId) ?? null

  useEffect(() => {
    fetch('/api/page').then(r => r.json()).then(({ pages }) => {
      const p = pages?.find((x: any) => x.id === id)
      if (p) {
        setPage(p); setBlocks(p.blocks_draft ?? p.blocks ?? []); setPageTitle(p.title ?? '')
        if (p.theme_draft?.name) { const idx = THEMES.findIndex(t => t.name === p.theme_draft.name); if (idx >= 0) setThemeIdx(idx) }
      }
    })
  }, [id])

  const salvar = async () => {
    setSalvando(true)
    const res = await fetch(`/api/page/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save', blocks, theme: THEMES[themeIdx], title: pageTitle }) })
    setSalvando(false)
    if (res.ok) { setMsg('Salvo ✓'); setTimeout(() => setMsg(''), 2000) }
    else { setMsg('Erro ao salvar'); setTimeout(() => setMsg(''), 3000) }
  }

  const publicar = async () => {
    setSalvando(true)
    await fetch(`/api/page/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save', blocks, theme: THEMES[themeIdx], title: pageTitle }) })
    const res = await fetch(`/api/page/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'publish' }) })
    setSalvando(false)
    if (res.ok) { setPage((p: any) => ({ ...p, status: 'active' })); setMsg('✅ Publicada!'); setTimeout(() => setMsg(''), 3000) }
    else { setMsg('Erro ao publicar'); setTimeout(() => setMsg(''), 3000) }
  }

  const despublicar = async () => {
    await fetch(`/api/page/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'unpublish' }) })
    setPage((p: any) => ({ ...p, status: 'draft' }))
  }

  const updateBlock = (field: string, value: any) => { if (!selectedId) return; setBlocks(bs => bs.map(b => b.id === selectedId ? { ...b, [field]: value } : b)) }
  const deleteBlock = (blockId: string) => { setBlocks(bs => bs.filter(b => b.id !== blockId)); if (selectedId === blockId) setSelectedId(null) }
  const moveBlock = (blockId: string, dir: 'up' | 'down') => {
    const idx = blocks.findIndex(b => b.id === blockId)
    if (dir === 'up' && idx === 0) return; if (dir === 'down' && idx === blocks.length - 1) return
    const nb = [...blocks];[nb[idx], nb[dir === 'up' ? idx - 1 : idx + 1]] = [nb[dir === 'up' ? idx - 1 : idx + 1], nb[idx]]; setBlocks(nb)
  }
  const addBlock = (partial: Partial<Block>) => {
    const nb = { ...partial, id: partial.id ?? `block-${Date.now()}` } as Block
    setBlocks(bs => [...bs, nb]); setSelectedId(nb.id); setShowSidebar(false)
    setTimeout(() => canvasRef.current?.scrollTo({ top: canvasRef.current.scrollHeight, behavior: 'smooth' }), 100)
  }

  if (!page) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#05090f', color: '#4e6a90', fontSize: '14px' }}>Carregando...</div>

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'DM Sans, sans-serif', background: '#05090f' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@300;400;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .canvas-block:hover { outline: 2px solid rgba(37,99,255,0.4) !important; outline-offset: 2px; }
        * { box-sizing: border-box; }
      `}</style>

      {/* PAINEL ESQUERDO */}
      <div style={{ width: '270px', flexShrink: 0, background: '#0a1120', borderRight: '1px solid #162035', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #0f1a2e' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '2px', letterSpacing: '-0.3px' }}>{selectedBlock ? `✏️ ${selectedBlock.label || selectedBlock.type}` : 'Propriedades'}</div>
          {!selectedBlock && <div style={{ fontSize: '11px', color: '#2e4560' }}>Clique em um bloco para editar</div>}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {selectedBlock ? <BlockEditor block={selectedBlock} onChange={updateBlock}/> : <div style={{ textAlign: 'center', padding: '40px 16px' }}><div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>👆</div><div style={{ fontSize: '12px', color: '#2e4560', lineHeight: 1.6 }}>Clique em qualquer bloco no canvas para editar as propriedades</div></div>}
        </div>
        <div style={{ padding: '10px 12px', borderTop: '1px solid #0f1a2e' }}>
          <button onClick={() => router.push('/dashboard/pages')} style={{ background: 'none', border: 'none', color: '#4e6a90', fontSize: '11px', cursor: 'pointer', padding: 0 }}>← Voltar às páginas</button>
        </div>
      </div>

      {/* CANVAS */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ height: '52px', background: '#0a1120', borderBottom: '1px solid #162035', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', flexShrink: 0 }}>
          <input value={pageTitle} onChange={e => setPageTitle(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#eef2ff', fontSize: '14px', fontWeight: '600', fontFamily: 'Syne, sans-serif', outline: 'none', flex: 1, letterSpacing: '-0.3px' }}/>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
            {msg && <span style={{ fontSize: '11px', color: msg.includes('Erro') ? '#f87171' : '#22c55e' }}>{msg}</span>}
            {page?.status === 'active' && <a href={`/p/${page.slug}`} target="_blank" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '11px', fontWeight: '600', padding: '5px 10px', borderRadius: '7px', textDecoration: 'none' }}>Ver →</a>}
            <button onClick={() => setShowThemes(!showThemes)} style={{ background: showThemes ? 'rgba(37,99,255,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${showThemes ? 'rgba(37,99,255,0.4)' : '#162035'}`, color: showThemes ? '#60a5fa' : '#4e6a90', fontSize: '11px', fontWeight: '600', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer' }}>🎨</button>
            <button onClick={salvar} disabled={salvando} style={{ background: '#0f1a2e', border: '1px solid #162035', color: '#4e6a90', fontSize: '11px', fontWeight: '600', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer' }}>{salvando ? '...' : '💾 Salvar'}</button>
            {page?.status === 'active'
              ? <button onClick={despublicar} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5', fontSize: '11px', fontWeight: '600', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer' }}>Tirar do ar</button>
              : <button onClick={publicar} disabled={salvando} style={{ background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontSize: '11px', fontWeight: '700', fontFamily: 'Syne, sans-serif', padding: '5px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer', boxShadow: '0 0 12px rgba(37,99,255,0.3)', opacity: salvando ? 0.7 : 1 }}>⚡ Publicar</button>}
          </div>
        </div>

        {/* Temas */}
        {showThemes && (
          <div style={{ background: '#0a1120', borderBottom: '1px solid #162035', padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>Tema:</span>
            {THEMES.map((t, i) => <button key={t.name} onClick={() => { setThemeIdx(i); setShowThemes(false) }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '7px', border: `1.5px solid ${themeIdx === i ? t.accent : '#162035'}`, background: themeIdx === i ? `${t.accent}15` : 'rgba(0,0,0,0.2)', cursor: 'pointer' }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', background: t.bg, border: `1px solid ${t.border}` }}/><span style={{ fontSize: '11px', color: themeIdx === i ? t.accent2 : '#4e6a90', fontWeight: '600' }}>{t.name}</span></button>)}
          </div>
        )}

        {/* Canvas area */}
        <div ref={canvasRef} onClick={e => { if (e.target === e.currentTarget) setSelectedId(null) }} style={{ flex: 1, overflowY: 'auto', background: '#030508', padding: '24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '680px' }}>
            {blocks.length === 0 && (
              <div onClick={() => setShowSidebar(true)} style={{ border: '2px dashed #162035', borderRadius: '16px', padding: '80px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,99,255,0.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,255,0.03)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#162035'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>+</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#4e6a90', fontFamily: 'Syne, sans-serif' }}>Clique para adicionar o primeiro bloco</div>
              </div>
            )}
            <div style={{ background: theme.bg, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 0 60px rgba(0,0,0,0.6)', border: `1px solid ${theme.border}` }}>
              {blocks.map((block, idx) => (
                <BlockRenderer key={block.id} block={block} theme={theme} selected={selectedId === block.id} onClick={() => setSelectedId(block.id === selectedId ? null : block.id)} onDelete={() => deleteBlock(block.id)} onMoveUp={() => moveBlock(block.id, 'up')} onMoveDown={() => moveBlock(block.id, 'down')} isFirst={idx === 0} isLast={idx === blocks.length - 1}/>
              ))}
            </div>
            {blocks.length > 0 && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button onClick={() => setShowSidebar(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37,99,255,0.07)', border: '1px dashed rgba(37,99,255,0.3)', color: '#60a5fa', fontSize: '13px', fontWeight: '600', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer' }}>+ Adicionar componente</button>
              </div>
            )}
            <div style={{ height: '60px' }}/>
          </div>
        </div>
      </div>

      <ComponentsSidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} onAdd={addBlock}/>
    </div>
  )
}