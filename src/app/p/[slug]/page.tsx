import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import CountdownTimer from '@/components/CountdownTimer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function renderTitle(text: string, accentColor: string) {
  return (text || '').split(/\*([^*]+)\*/).map((part, i) =>
    i % 2 === 1 ? <span key={i} style={{ color: accentColor }}>{part}</span> : <span key={i}>{part}</span>
  )
}

export default async function PublicPageView(props: any) {
  const { slug } = await props.params
  const { data: page } = await supabase.from('pages').select('*').eq('slug', slug).eq('status', 'active').single()
  if (!page) notFound()

  const blocks: any[] = page.blocks ?? []
  const theme = page.theme ?? { bg: '#05090f', surface: '#0a1120', border: '#162035', accent: '#2563ff', accent2: '#60a5fa', text: '#eef2ff', muted: '#4e6a90' }

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@300;400;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        details > summary { list-style: none; cursor: pointer; }
        details > summary::-webkit-details-marker { display: none; }
      `}</style>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 16px' }}>
        {blocks.map((block: any) => {
          const padMap: Record<string, string> = { none: '0', sm: '16px', md: '40px', lg: '64px', xl: '96px' }
          const wrapStyle: React.CSSProperties = {
            ...(block.blockBgImage ? { backgroundImage: `url(${block.blockBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
            ...(block.blockBg ? { background: block.blockBg } : {}),
            ...(block.blockPadding ? { padding: `${padMap[block.blockPadding] || '40px'} 24px` } : {}),
            ...(block.blockFullWidth ? { width: '100vw', marginLeft: 'calc(-50vw + 50%)', paddingLeft: '24px', paddingRight: '24px' } : {}),
          }
          const content = <BlockContent key={block.id} block={block} theme={theme} />
          return Object.keys(wrapStyle).length > 0
            ? <div key={block.id} style={wrapStyle}>{content}</div>
            : content
        })}
      </div>
    </div>
  )
}

function BlockContent({ block, theme }: { block: any; theme: any }) {
  const rt = (t: string) => renderTitle(t || '', theme.accent2)
  const inp: React.CSSProperties = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '14px 16px', color: theme.text, fontSize: '15px', outline: 'none', width: '100%', display: 'block' }

  switch (block.type) {
    case 'rich':
      if (block.htmlCode) return <div dangerouslySetInnerHTML={{ __html: block.htmlCode }} />
      return (
        <div style={{ padding: '40px 0' }}>
          {block.title && <h2 style={{ fontSize: 'clamp(24px,5vw,42px)', fontWeight: block.titleBold ? '700' : '300', fontFamily: block.fontFamily || 'Syne, sans-serif', color: block.titleColor || theme.text, marginBottom: '12px', lineHeight: 1.15, letterSpacing: '-0.5px' }}>{rt(block.title)}</h2>}
          {block.subtitle && <p style={{ fontSize: '16px', color: theme.muted, lineHeight: 1.75, marginBottom: '20px' }}>{block.subtitle}</p>}
          {block.sections?.map((s: any) => (
            <div key={s.id} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '10px', display: 'flex', gap: '14px' }}>
              {s.badge && <span style={{ fontSize: '20px', flexShrink: 0 }}>{s.badge}</span>}
              <div>
                {s.title && <div style={{ fontSize: '15px', fontWeight: '600', color: theme.text, marginBottom: '4px' }}>{s.title}</div>}
                {s.text && <div style={{ fontSize: '14px', color: theme.muted }}>{s.text}</div>}
              </div>
            </div>
          ))}
          {block.faqItems?.length > 0 && (
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '14px', overflow: 'hidden', marginTop: '12px' }}>
              {block.faqItems.map((faq: any, i: number) => (
                <details key={i} style={{ borderBottom: i < block.faqItems.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
                  <summary style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px', fontWeight: '600', color: theme.text, cursor: 'pointer', userSelect: 'none' }}>
                    <span>{faq.q}</span>
                    <span style={{ fontSize: '20px', fontWeight: '300', color: theme.muted, flexShrink: 0, marginLeft: '12px' }}>+</span>
                  </summary>
                  <div style={{ padding: '0 20px 16px', fontSize: '14px', color: theme.muted, lineHeight: 1.75 }}>{faq.a}</div>
                </details>
              ))}
            </div>
          )}
          {block.carouselItems?.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', marginTop: '12px' }}>
              {block.carouselItems.map((item: any, i: number) => (
                <div key={i} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px', minWidth: '200px', flexShrink: 0 }}>
                  {item.image && <img src={item.image} alt={item.title || ''} style={{ width: '100%', borderRadius: '8px', marginBottom: '10px' }}/>}
                  {item.title && <div style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '4px' }}>{item.title}</div>}
                  {item.text && <div style={{ fontSize: '12px', color: theme.muted }}>{item.text}</div>}
                </div>
              ))}
            </div>
          )}
          {(block.beforeImage || block.afterImage || block.beforeText || block.afterText) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: '700', color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>ANTES</div>
                {block.beforeImage && <img src={block.beforeImage} alt="Antes" style={{ width: '100%', borderRadius: '10px', border: `1px solid ${theme.border}` }}/>}
                {block.beforeText && <p style={{ fontSize: '13px', color: theme.muted, marginTop: '6px', textAlign: 'center' }}>{block.beforeText}</p>}
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: '700', color: theme.accent2, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>DEPOIS</div>
                {block.afterImage && <img src={block.afterImage} alt="Depois" style={{ width: '100%', borderRadius: '10px', border: `1px solid ${theme.accent}` }}/>}
                {block.afterText && <p style={{ fontSize: '13px', color: theme.text, marginTop: '6px', textAlign: 'center', fontWeight: '600' }}>{block.afterText}</p>}
              </div>
            </div>
          )}
          {block.imageUrl && !block.beforeImage && <img src={block.imageUrl} alt={block.imageAlt || ''} style={{ width: '100%', borderRadius: '12px', marginTop: '12px' }}/>}
        </div>
      )

    case 'insight':
      if (block.notificationText) return (
        <div style={{ padding: '12px 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '10px 16px' }}>
            <span style={{ fontSize: '18px' }}>{block.notificationIcon || '🔔'}</span>
            <span style={{ fontSize: '14px', color: theme.text }}>{block.notificationText}</span>
          </div>
        </div>
      )
      if (block.timerSeconds) return (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          {block.title && <h3 style={{ fontSize: '22px', fontWeight: '700', color: theme.text, marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
          {block.subtitle && <p style={{ fontSize: '14px', color: theme.muted, marginBottom: '16px' }}>{block.subtitle}</p>}
          <CountdownTimer seconds={block.timerSeconds} theme={theme}/>
        </div>
      )
      return (
        <div style={{ padding: '16px 0' }}>
          <div style={{ background: block.alertType === 'warning' ? 'rgba(251,191,36,0.1)' : block.alertType === 'success' ? 'rgba(34,197,94,0.1)' : block.alertType === 'error' ? 'rgba(248,113,113,0.1)' : 'rgba(37,99,255,0.1)', border: `1px solid ${block.alertType === 'warning' ? 'rgba(251,191,36,0.4)' : block.alertType === 'success' ? 'rgba(34,197,94,0.4)' : block.alertType === 'error' ? 'rgba(248,113,113,0.4)' : 'rgba(37,99,255,0.4)'}`, borderLeft: `4px solid ${block.alertType === 'warning' ? '#fbbf24' : block.alertType === 'success' ? '#22c55e' : block.alertType === 'error' ? '#f87171' : theme.accent}`, borderRadius: '10px', padding: '16px 20px' }}>
            {block.alertIcon && <div style={{ fontSize: '28px', marginBottom: '8px' }}>{block.alertIcon}</div>}
            {block.title && <div style={{ fontSize: '16px', fontWeight: '700', color: theme.text, marginBottom: '6px' }}>{block.title}</div>}
            {block.subtitle && <div style={{ fontSize: '14px', color: theme.muted, lineHeight: 1.6 }}>{block.subtitle}</div>}
          </div>
        </div>
      )

    case 'bridge':
      if (block.spacerHeight) return <div style={{ height: block.spacerHeight }}/>
      return (
        <div style={{ padding: '32px 0', textAlign: 'center' }}>
          {block.title && <p style={{ fontSize: '16px', color: theme.muted, fontStyle: 'italic' }}>{block.title}</p>}
        </div>
      )

    case 'social_proof':
      return (
        <div style={{ padding: '16px 0' }}>
          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '24px' }}>
            {block.testimonialStars && <div style={{ marginBottom: '12px' }}>{'★'.repeat(block.testimonialStars).split('').map((s, i) => <span key={i} style={{ color: '#fbbf24', fontSize: '18px' }}>{s}</span>)}</div>}
            {block.testimonialText && <p style={{ fontSize: '15px', color: theme.text, lineHeight: 1.75, marginBottom: '16px', fontStyle: 'italic' }}>"{block.testimonialText}"</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>{block.testimonialName?.[0]?.toUpperCase() || '?'}</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: theme.text }}>{block.testimonialName}</div>
                {block.testimonialRole && <div style={{ fontSize: '12px', color: theme.muted }}>{block.testimonialRole}</div>}
              </div>
            </div>
          </div>
        </div>
      )

    case 'offer':
      if (block.plans?.length > 0) return (
        <div style={{ padding: '32px 0', textAlign: 'center' }}>
          {block.title && <h3 style={{ fontSize: '28px', fontWeight: '700', color: theme.text, marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>{rt(block.title)}</h3>}
          {block.subtitle && <p style={{ fontSize: '14px', color: theme.muted, marginBottom: '28px' }}>{block.subtitle}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(block.plans.length, 3)}, 1fr)`, gap: '16px' }}>
            {block.plans.map((plan: any, i: number) => (
              <div key={i} style={{ background: theme.surface, border: `1px solid ${plan.highlight ? theme.accent : theme.border}`, borderRadius: '16px', padding: '24px', position: 'relative', boxShadow: plan.highlight ? `0 0 32px ${theme.accent}40` : 'none' }}>
                {plan.badge && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{plan.badge}</div>}
                {plan.name && <div style={{ fontSize: '13px', fontWeight: '700', color: theme.muted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{plan.name}</div>}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px', justifyContent: 'center' }}>
                  <span style={{ fontSize: '36px', fontWeight: '300', fontFamily: 'Syne, sans-serif', color: theme.text, letterSpacing: '-1px' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: '13px', color: theme.muted }}>{plan.period}</span>}
                </div>
                {plan.features?.map((f: string, fi: number) => <div key={fi} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', fontSize: '13px', color: theme.text, textAlign: 'left' }}><span style={{ color: theme.accent2, flexShrink: 0 }}>✓</span>{f}</div>)}
                {plan.buttonText && <a href={plan.buttonUrl || '#'} style={{ display: 'block', marginTop: '16px', background: plan.highlight ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` : 'transparent', border: `1px solid ${plan.highlight ? 'transparent' : theme.border}`, color: plan.highlight ? '#fff' : theme.text, textAlign: 'center', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', textDecoration: 'none', fontFamily: 'Syne, sans-serif', boxShadow: plan.highlight ? `0 0 20px ${theme.accent}50` : 'none' }}>{plan.buttonText}</a>}
              </div>
            ))}
          </div>
        </div>
      )
      if (block.priceValue) return (
        <div style={{ padding: '32px 0', textAlign: 'center' }}>
          {block.title && <h3 style={{ fontSize: '26px', fontWeight: '700', color: theme.text, marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>{rt(block.title)}</h3>}
          {block.subtitle && <p style={{ fontSize: '14px', color: theme.muted, marginBottom: '24px' }}>{block.subtitle}</p>}
          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '20px', padding: '28px', display: 'inline-block', minWidth: '260px', textAlign: 'left', boxShadow: `0 0 40px ${theme.accent}20` }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '20px' }}>
              <span style={{ fontSize: '42px', fontWeight: '300', fontFamily: 'Syne, sans-serif', color: theme.text, letterSpacing: '-1.5px' }}>{block.priceValue}</span>
              {block.pricePeriod && <span style={{ fontSize: '14px', color: theme.muted }}>{block.pricePeriod}</span>}
            </div>
            {block.priceFeatures?.map((f: string, i: number) => <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', fontSize: '14px', color: theme.text }}><span style={{ color: theme.accent2 }}>✓</span>{f}</div>)}
            {block.priceButtonText && <a href={block.priceButtonUrl || '#'} style={{ display: 'block', marginTop: '20px', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, color: '#fff', textAlign: 'center', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', fontFamily: 'Syne, sans-serif', boxShadow: `0 0 24px ${theme.accent}50` }}>{block.priceButtonText}</a>}
          </div>
        </div>
      )
      return (
        <div style={{ padding: '32px 0', textAlign: 'center' }}>
          {block.title && <h3 style={{ fontSize: '22px', fontWeight: '700', color: theme.text, marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>{rt(block.title)}</h3>}
          {block.subtitle && <p style={{ fontSize: '14px', color: theme.muted, marginBottom: '24px' }}>{block.subtitle}</p>}
          <a href={block.buttonUrl || '#'} style={{ display: 'inline-block', background: block.buttonBg || `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, color: block.buttonColor || '#fff', padding: block.buttonSize === 'sm' ? '10px 24px' : block.buttonSize === 'lg' ? '18px 48px' : '14px 36px', borderRadius: '12px', fontSize: block.buttonFontSize || '15px', fontWeight: '700', textDecoration: 'none', fontFamily: block.buttonFont || 'Syne, sans-serif', boxShadow: `0 0 24px ${theme.accent}50` }}>{block.buttonText || 'Continuar →'}</a>
        </div>
      )

    case 'video':
      return (
        <div style={{ padding: '24px 0' }}>
          {block.title && <h3 style={{ fontSize: '20px', fontWeight: '600', color: theme.text, marginBottom: '12px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
          {block.videoUrl && (
            <div style={{ borderRadius: '14px', overflow: 'hidden', aspectRatio: '16/9' }}>
              <iframe src={`https://www.youtube.com/embed/${block.videoUrl.match(/[?&]v=([^&]+)/)?.[1] || block.videoUrl.split('/').pop()}`} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen/>
            </div>
          )}
        </div>
      )

    case 'question':
      return (
        <div style={{ padding: '32px 0' }}>
          {block.title && <h3 style={{ fontSize: '22px', fontWeight: '700', color: theme.text, marginBottom: '20px', fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }}>{block.title}</h3>}
          {block.imageOptions?.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(block.imageOptions.length, 3)}, 1fr)`, gap: '12px' }}>
              {block.imageOptions.map((opt: any, i: number) => (
                <div key={i} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '14px', overflow: 'hidden', cursor: 'pointer' }}>
                  {opt.image && <img src={opt.image} alt={opt.label} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }}/>}
                  <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${theme.accent}`, flexShrink: 0 }}/>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.text }}>{opt.label}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(block.options || []).map((opt: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', border: `1px solid ${theme.border}`, borderRadius: '12px', background: theme.surface, cursor: 'pointer' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: block.multipleChoice ? '4px' : '50%', border: `2px solid ${theme.muted}`, flexShrink: 0 }}/>
                  <span style={{ fontSize: '15px', color: theme.text }}>{opt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )

    case 'meter':
      return (
        <div style={{ padding: '32px 0', textAlign: 'center' }}>
          {block.title && <h3 style={{ fontSize: '22px', fontWeight: '700', color: theme.text, marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
          {block.subtitle && <p style={{ fontSize: '14px', color: theme.muted, marginBottom: '20px' }}>{block.subtitle}</p>}
          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '24px', maxWidth: '360px', margin: '0 auto' }}>
            <div style={{ fontSize: '11px', color: theme.muted, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{block.meterLabel || 'Score'}</div>
            <div style={{ height: '10px', background: theme.border, borderRadius: '5px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ height: '100%', width: '73%', background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`, borderRadius: '5px' }}/>
            </div>
            <div style={{ fontSize: '36px', fontWeight: '300', fontFamily: 'Syne, sans-serif', color: theme.accent }}>7/{block.meterMax || 10}</div>
          </div>
        </div>
      )

    case 'field':
      return (
        <div style={{ padding: '32px 0' }}>
          {block.title && <h3 style={{ fontSize: '22px', fontWeight: '700', color: theme.text, marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
          {block.subtitle && <p style={{ fontSize: '14px', color: theme.muted, marginBottom: '20px' }}>{block.subtitle}</p>}
          {block.fieldType === 'height_weight' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input placeholder={block.heightLabel || 'Altura (cm)'} style={inp}/>
              <input placeholder={block.weightLabel || 'Peso (kg)'} style={inp}/>
            </div>
          ) : (
            <input placeholder={block.fieldPlaceholder || 'Digite aqui...'} type={block.fieldType === 'email' ? 'email' : block.fieldType === 'phone' ? 'tel' : 'text'} style={inp}/>
          )}
        </div>
      )

    case 'capture':
      return (
        <div style={{ padding: '32px 0' }}>
          {block.title && <h3 style={{ fontSize: '22px', fontWeight: '700', color: theme.text, marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
          {block.subtitle && <p style={{ fontSize: '14px', color: theme.muted, marginBottom: '20px' }}>{block.subtitle}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['Nome completo', 'E-mail', 'WhatsApp'].map((f, i) => <input key={i} placeholder={f} style={inp}/>)}
          </div>
        </div>
      )

    default:
      return null
  }
}