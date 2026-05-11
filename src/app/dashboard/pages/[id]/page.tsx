'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ComponentsSidebar from '@/components/editor/ComponentsSidebar'

interface Block {
  id: string
  type: string
  label: string
  title: string
  subtitle: string
  options: string[]
  imageUrl?: string
  videoUrl?: string
  videoProvider?: string
  testimonialName?: string
  testimonialRole?: string
  testimonialText?: string
  testimonialStars?: number
  buttonText?: string
  buttonUrl?: string
  meterLabel?: string
  meterMax?: number
  sections?: any[]
  timerSeconds?: number
  alertType?: string
  priceValue?: string
  pricePeriod?: string
  priceFeatures?: string[]
  priceButtonText?: string
  priceButtonUrl?: string
  faqItems?: { q: string; a: string }[]
  htmlCode?: string
  spacerHeight?: number
  notificationText?: string
  loadingText?: string
  titleBold?: boolean
  titleColor?: string
  fontFamily?: string
  [key: string]: any
}

const THEMES = [
  { name: 'Dark Azul',    bg: '#05090f', surface: '#0a1120', border: '#162035', accent: '#2563ff', accent2: '#60a5fa', text: '#eef2ff', muted: '#4e6a90' },
  { name: 'Dark Roxo',   bg: '#08050f', surface: '#120a20', border: '#1e1035', accent: '#7c3aed', accent2: '#a78bfa', text: '#f5f0ff', muted: '#6b5a90' },
  { name: 'Dark Verde',  bg: '#050f09', surface: '#0a2012', border: '#163520', accent: '#059669', accent2: '#34d399', text: '#f0fff4', muted: '#4e9070' },
  { name: 'Claro',       bg: '#f8fafc', surface: '#ffffff', border: '#e2e8f0', accent: '#2563ff', accent2: '#3b82f6', text: '#0f172a', muted: '#64748b' },
]

const inp = (extra?: React.CSSProperties): React.CSSProperties => ({ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #162035', borderRadius: '8px', color: '#eef2ff', fontSize: '12px', padding: '8px 10px', outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif', ...extra })
const lbl: React.CSSProperties = { display: 'block', fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }

// ── Renderizador de bloco no canvas ────────────────────────────────────────
function BlockRenderer({ block, theme, selected, onClick, onDelete, onMoveUp, onMoveDown, isFirst, isLast }:
  { block: Block; theme: typeof THEMES[0]; selected: boolean; onClick: () => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; isFirst: boolean; isLast: boolean }) {

  const renderTitle = (text: string) => {
    const parts = text.split(/\*([^*]+)\*/)
    return parts.map((part, i) => i % 2 === 1
      ? <span key={i} style={{ color: theme.accent2 }}>{part}</span>
      : <span key={i}>{part}</span>
    )
  }

  const baseStyle: React.CSSProperties = {
    position: 'relative', cursor: 'pointer', transition: 'all 0.15s',
    outline: selected ? `2px solid ${theme.accent}` : '2px solid transparent',
    outlineOffset: '2px', borderRadius: '4px',
  }

  const renderContent = () => {
    switch (block.type) {
      case 'rich':
        return (
          <div style={{ padding: '32px 24px', background: theme.bg }}>
            {block.title && (
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: block.titleBold ? '700' : '300', fontFamily: block.fontFamily || 'Syne, sans-serif', color: block.titleColor || theme.text, margin: '0 0 12px', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
                {renderTitle(block.title)}
              </h2>
            )}
            {block.subtitle && <p style={{ fontSize: '15px', color: theme.muted, margin: '0 0 16px', lineHeight: 1.7 }}>{block.subtitle}</p>}
            {block.sections?.map((s: any) => (
              <div key={s.id} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {s.badge && <span style={{ fontSize: '18px', flexShrink: 0 }}>{s.badge}</span>}
                <div>
                  {s.title && <div style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '4px' }}>{s.title}</div>}
                  {s.text && <div style={{ fontSize: '13px', color: theme.muted }}>{s.text}</div>}
                </div>
              </div>
            ))}
          </div>
        )

      case 'insight':
        if (block.notificationText) return (
          <div style={{ padding: '16px 24px', background: theme.bg }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '10px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <span style={{ fontSize: '18px' }}>{block.notificationIcon || '🔔'}</span>
              <span style={{ fontSize: '13px', color: theme.text }}>{block.notificationText}</span>
            </div>
          </div>
        )
        if (block.timerSeconds) return (
          <div style={{ padding: '32px 24px', textAlign: 'center', background: theme.bg }}>
            {block.title && <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.text, margin: '0 0 12px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
            {block.subtitle && <p style={{ fontSize: '13px', color: theme.muted, margin: '0 0 16px' }}>{block.subtitle}</p>}
            <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
              {['00', '10', '00'].map((v, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'monospace', color: theme.accent }}>{v}</div>
                    <div style={{ fontSize: '9px', color: theme.muted }}>{['HORAS', 'MIN', 'SEG'][i]}</div>
                  </div>
                  {i < 2 && <span style={{ color: theme.muted, fontSize: '20px' }}>:</span>}
                </div>
              ))}
            </div>
          </div>
        )
        return (
          <div style={{ padding: '24px', background: theme.bg }}>
            <div style={{ background: block.alertType === 'warning' ? 'rgba(251,191,36,0.08)' : block.alertType === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(37,99,255,0.08)', border: `1px solid ${block.alertType === 'warning' ? 'rgba(251,191,36,0.3)' : block.alertType === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(37,99,255,0.3)'}`, borderRadius: '12px', padding: '16px 20px' }}>
              {block.title && <div style={{ fontSize: '15px', fontWeight: '600', color: theme.text, marginBottom: '6px' }}>{block.title}</div>}
              {block.subtitle && <div style={{ fontSize: '13px', color: theme.muted }}>{block.subtitle}</div>}
            </div>
          </div>
        )

      case 'bridge':
        if (block.spacerHeight) return <div style={{ height: block.spacerHeight, background: theme.bg }}/>
        if (block.loadingText) return (
          <div style={{ padding: '40px 24px', textAlign: 'center', background: theme.bg }}>
            {block.title && <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.text, margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '16px 0' }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.accent, opacity: 0.4 + i * 0.3 }}/>)}
            </div>
            {block.subtitle && <p style={{ fontSize: '13px', color: theme.muted }}>{block.subtitle}</p>}
          </div>
        )
        return (
          <div style={{ padding: '24px', textAlign: 'center', background: theme.bg }}>
            {block.title && <p style={{ fontSize: '16px', color: theme.muted, fontStyle: 'italic', margin: 0 }}>{block.title}</p>}
          </div>
        )

      case 'social_proof':
        return (
          <div style={{ padding: '24px', background: theme.bg }}>
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '14px', padding: '20px' }}>
              {block.testimonialStars && (
                <div style={{ marginBottom: '10px' }}>
                  {'★'.repeat(block.testimonialStars).split('').map((s, i) => <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>{s}</span>)}
                </div>
              )}
              {block.testimonialText && <p style={{ fontSize: '14px', color: theme.text, lineHeight: 1.7, margin: '0 0 14px', fontStyle: 'italic' }}>"{block.testimonialText}"</p>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                  {block.testimonialName?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>{block.testimonialName || 'Nome'}</div>
                  {block.testimonialRole && <div style={{ fontSize: '11px', color: theme.muted }}>{block.testimonialRole}</div>}
                </div>
              </div>
            </div>
          </div>
        )

      case 'offer':
        if (block.priceValue) return (
          <div style={{ padding: '32px 24px', background: theme.bg, textAlign: 'center' }}>
            {block.title && <h3 style={{ fontSize: '22px', fontWeight: '700', color: theme.text, margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
            {block.subtitle && <p style={{ fontSize: '13px', color: theme.muted, margin: '0 0 20px' }}>{block.subtitle}</p>}
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '24px', display: 'inline-block', minWidth: '240px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                <span style={{ fontSize: '36px', fontWeight: '300', fontFamily: 'Syne, sans-serif', color: theme.text, letterSpacing: '-1px' }}>{block.priceValue}</span>
                {block.pricePeriod && <span style={{ fontSize: '13px', color: theme.muted }}>{block.pricePeriod}</span>}
              </div>
              {block.priceFeatures?.map((f: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', fontSize: '13px', color: theme.text }}>
                  <span style={{ color: theme.accent2 }}>✓</span>{f}
                </div>
              ))}
              <div style={{ marginTop: '16px', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, color: '#fff', textAlign: 'center', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
                {block.priceButtonText || 'Quero agora →'}
              </div>
            </div>
          </div>
        )
        return (
          <div style={{ padding: '32px 24px', textAlign: 'center', background: theme.bg }}>
            {block.title && <h3 style={{ fontSize: '22px', fontWeight: '700', color: theme.text, margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
            {block.subtitle && <p style={{ fontSize: '13px', color: theme.muted, margin: '0 0 20px' }}>{block.subtitle}</p>}
            <div style={{ display: 'inline-block', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, color: '#fff', padding: '14px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', fontFamily: 'Syne, sans-serif', boxShadow: `0 0 24px ${theme.accent}50` }}>
              {block.buttonText || 'Continuar →'}
            </div>
          </div>
        )

      case 'video':
        return (
          <div style={{ padding: '24px', background: theme.bg }}>
            {block.title && <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.text, margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '12px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {block.videoUrl ? (
                <div style={{ textAlign: 'center', color: theme.muted }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎥</div>
                  <div style={{ fontSize: '12px' }}>{block.videoUrl.substring(0, 40)}...</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: theme.muted }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.5 }}>▶</div>
                  <div style={{ fontSize: '12px' }}>Cole a URL do vídeo no painel</div>
                </div>
              )}
            </div>
          </div>
        )

      case 'question':
        return (
          <div style={{ padding: '32px 24px', background: theme.bg }}>
            {block.title && <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.text, margin: '0 0 20px', fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }}>{block.title}</h3>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(block.options || []).map((opt: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: `1px solid ${theme.border}`, borderRadius: '10px', background: theme.surface, cursor: 'pointer' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `1.5px solid ${theme.muted}`, flexShrink: 0 }}/>
                  <span style={{ fontSize: '14px', color: theme.text }}>{opt}</span>
                </div>
              ))}
              {(!block.options || block.options.length === 0) && (
                <div style={{ fontSize: '13px', color: theme.muted, fontStyle: 'italic' }}>Adicione opções no painel →</div>
              )}
            </div>
          </div>
        )

      case 'meter':
        return (
          <div style={{ padding: '32px 24px', textAlign: 'center', background: theme.bg }}>
            {block.title && <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.text, margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
            {block.subtitle && <p style={{ fontSize: '13px', color: theme.muted, margin: '0 0 20px' }}>{block.subtitle}</p>}
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: theme.muted, marginBottom: '8px' }}>{block.meterLabel || 'Score'}</div>
              <div style={{ height: '8px', background: theme.border, borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', width: '73%', background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`, borderRadius: '4px' }}/>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '300', fontFamily: 'Syne, sans-serif', color: theme.accent }}>7/{block.meterMax || 10}</div>
            </div>
          </div>
        )

      case 'field':
        return (
          <div style={{ padding: '32px 24px', background: theme.bg }}>
            {block.title && <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.text, margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
            {block.subtitle && <p style={{ fontSize: '13px', color: theme.muted, margin: '0 0 16px' }}>{block.subtitle}</p>}
            {block.fieldType === 'height_weight' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '12px 14px', color: theme.muted, fontSize: '14px' }}>{block.heightLabel || 'Altura (cm)'}</div>
                <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '12px 14px', color: theme.muted, fontSize: '14px' }}>{block.weightLabel || 'Peso (kg)'}</div>
              </div>
            ) : (
              <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '12px 14px', color: theme.muted, fontSize: '14px' }}>
                {block.fieldPlaceholder || 'Digite aqui...'}
              </div>
            )}
          </div>
        )

      case 'capture':
        return (
          <div style={{ padding: '32px 24px', background: theme.bg }}>
            {block.title && <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.text, margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
            {block.subtitle && <p style={{ fontSize: '13px', color: theme.muted, margin: '0 0 16px' }}>{block.subtitle}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Nome completo', 'E-mail', 'WhatsApp'].map((f, i) => (
                <div key={i} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '12px 14px', color: theme.muted, fontSize: '14px' }}>{f}</div>
              ))}
              <div style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, color: '#fff', textAlign: 'center', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', fontFamily: 'Syne, sans-serif' }}>
                Ver meu resultado →
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div style={{ padding: '24px', background: theme.bg }}>
            {block.title && <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.text, margin: 0, fontFamily: 'Syne, sans-serif' }}>{block.title}</h3>}
            {block.subtitle && <p style={{ fontSize: '13px', color: theme.muted, margin: '8px 0 0' }}>{block.subtitle}</p>}
          </div>
        )
    }
  }

  return (
    <div style={baseStyle} onClick={onClick} className="canvas-block">
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

// ── Painel de edição do bloco selecionado ───────────────────────────────────
function BlockEditor({ block, onChange }: { block: Block; onChange: (field: string, value: any) => void }) {
  const textareaStyle = inp({ resize: 'vertical' as const, minHeight: '72px' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Título */}
      <div>
        <label style={lbl}>Título <span style={{ color: '#60a5fa', textTransform: 'none', letterSpacing: 0, fontSize: '9px' }}>(*palavra* = destaque)</span></label>
        <textarea value={block.title} onChange={e => onChange('title', e.target.value)} style={textareaStyle}/>
      </div>

      {/* Subtítulo */}
      {['rich', 'insight', 'bridge', 'offer', 'video', 'capture', 'meter'].includes(block.type) && (
        <div>
          <label style={lbl}>Subtítulo / Texto</label>
          <textarea value={block.subtitle} onChange={e => onChange('subtitle', e.target.value)} style={textareaStyle}/>
        </div>
      )}

      {/* Opções (question) */}
      {block.type === 'question' && (
        <div>
          <label style={lbl}>Opções (uma por linha)</label>
          <textarea value={(block.options || []).join('\n')} onChange={e => onChange('options', e.target.value.split('\n'))} rows={4} style={textareaStyle}/>
        </div>
      )}

      {/* Botão */}
      {block.type === 'offer' && !block.priceValue && (
        <>
          <div><label style={lbl}>Texto do botão</label><input value={block.buttonText || ''} onChange={e => onChange('buttonText', e.target.value)} style={inp()}/></div>
          <div><label style={lbl}>URL do botão</label><input value={block.buttonUrl || ''} onChange={e => onChange('buttonUrl', e.target.value)} placeholder="https://..." style={inp()}/></div>
        </>
      )}

      {/* Preço */}
      {block.priceValue !== undefined && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div><label style={lbl}>Preço</label><input value={block.priceValue || ''} onChange={e => onChange('priceValue', e.target.value)} placeholder="R$997" style={inp()}/></div>
            <div><label style={lbl}>Período</label><input value={block.pricePeriod || ''} onChange={e => onChange('pricePeriod', e.target.value)} placeholder="acesso vitalício" style={inp()}/></div>
          </div>
          <div>
            <label style={lbl}>Features (uma por linha)</label>
            <textarea value={(block.priceFeatures || []).join('\n')} onChange={e => onChange('priceFeatures', e.target.value.split('\n').filter(Boolean))} rows={4} style={textareaStyle}/>
          </div>
          <div><label style={lbl}>Texto do botão</label><input value={block.priceButtonText || ''} onChange={e => onChange('priceButtonText', e.target.value)} style={inp()}/></div>
          <div><label style={lbl}>URL do botão</label><input value={block.priceButtonUrl || ''} onChange={e => onChange('priceButtonUrl', e.target.value)} placeholder="https://..." style={inp()}/></div>
        </>
      )}

      {/* Depoimento */}
      {block.type === 'social_proof' && (
        <>
          <div><label style={lbl}>Nome</label><input value={block.testimonialName || ''} onChange={e => onChange('testimonialName', e.target.value)} style={inp()}/></div>
          <div><label style={lbl}>Cargo / Resultado</label><input value={block.testimonialRole || ''} onChange={e => onChange('testimonialRole', e.target.value)} style={inp()}/></div>
          <div><label style={lbl}>Depoimento</label><textarea value={block.testimonialText || ''} onChange={e => onChange('testimonialText', e.target.value)} rows={3} style={textareaStyle}/></div>
          <div>
            <label style={lbl}>Estrelas</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => onChange('testimonialStars', n)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: n <= (block.testimonialStars || 5) ? '#fbbf24' : '#2e4560' }}>★</button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Vídeo */}
      {block.type === 'video' && (
        <>
          <div>
            <label style={lbl}>URL do vídeo</label>
            <input value={block.videoUrl || ''} onChange={e => onChange('videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=..." style={inp()}/>
          </div>
          <div>
            <label style={lbl}>Plataforma</label>
            <select value={block.videoProvider || 'youtube'} onChange={e => onChange('videoProvider', e.target.value)} style={inp()}>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="vturb">VTurb</option>
            </select>
          </div>
        </>
      )}

      {/* Medidor */}
      {block.type === 'meter' && (
        <>
          <div><label style={lbl}>Label</label><input value={block.meterLabel || ''} onChange={e => onChange('meterLabel', e.target.value)} style={inp()}/></div>
          <div>
            <label style={lbl}>Máximo</label>
            <input type="number" min={1} max={100} value={block.meterMax || 10} onChange={e => onChange('meterMax', Number(e.target.value))} style={inp()}/>
          </div>
        </>
      )}

      {/* Notificação */}
      {block.notificationText !== undefined && (
        <>
          <div><label style={lbl}>Texto da notificação</label><input value={block.notificationText || ''} onChange={e => onChange('notificationText', e.target.value)} style={inp()}/></div>
          <div><label style={lbl}>Ícone</label><input value={block.notificationIcon || '🔔'} onChange={e => onChange('notificationIcon', e.target.value)} style={{ ...inp(), width: '80px' }}/></div>
        </>
      )}

      {/* Timer */}
      {block.timerSeconds !== undefined && (
        <div>
          <label style={lbl}>Tempo (segundos)</label>
          <input type="number" value={block.timerSeconds || 600} onChange={e => onChange('timerSeconds', Number(e.target.value))} style={inp()}/>
        </div>
      )}

      {/* Espaço */}
      {block.spacerHeight !== undefined && (
        <div>
          <label style={lbl}>Altura (px)</label>
          <input type="range" min={8} max={200} value={block.spacerHeight || 40} onChange={e => onChange('spacerHeight', Number(e.target.value))} style={{ width: '100%' }}/>
          <div style={{ fontSize: '10px', color: '#4e6a90', marginTop: '4px' }}>{block.spacerHeight || 40}px</div>
        </div>
      )}

      {/* Seções (rich) */}
      {block.type === 'rich' && !block.htmlCode && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ ...lbl, marginBottom: 0 }}>Sub-seções</label>
            <button onClick={() => onChange('sections', [...(block.sections || []), { id: `s-${Date.now()}`, badge: '✅', title: '', text: '' }])} style={{ background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer' }}>+ Adicionar</button>
          </div>
          {(block.sections || []).map((s: any, i: number) => (
            <div key={s.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #0f1a2e', borderRadius: '8px', padding: '10px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                <input value={s.badge || ''} onChange={e => { const secs = [...(block.sections || [])]; secs[i] = { ...secs[i], badge: e.target.value }; onChange('sections', secs) }} placeholder="emoji" style={{ ...inp(), width: '60px' }}/>
                <input value={s.title || ''} onChange={e => { const secs = [...(block.sections || [])]; secs[i] = { ...secs[i], title: e.target.value }; onChange('sections', secs) }} placeholder="Título" style={inp()}/>
                <button onClick={() => { const secs = (block.sections || []).filter((_: any, j: number) => j !== i); onChange('sections', secs) }} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>✕</button>
              </div>
              <input value={s.text || ''} onChange={e => { const secs = [...(block.sections || [])]; secs[i] = { ...secs[i], text: e.target.value }; onChange('sections', secs) }} placeholder="Descrição" style={inp()}/>
            </div>
          ))}
        </div>
      )}

      {/* HTML */}
      {block.htmlCode !== undefined && (
        <div>
          <label style={lbl}>Código HTML / Script</label>
          <textarea value={block.htmlCode || ''} onChange={e => onChange('htmlCode', e.target.value)} rows={6} style={{ ...textareaStyle, fontFamily: 'monospace', fontSize: '11px' }}/>
        </div>
      )}

      {/* Campo */}
      {block.type === 'field' && (
        <>
          <div>
            <label style={lbl}>Tipo de campo</label>
            <select value={block.fieldType || 'text'} onChange={e => onChange('fieldType', e.target.value)} style={inp()}>
              <option value="text">Texto</option>
              <option value="email">E-mail</option>
              <option value="phone">Telefone / WhatsApp</option>
              <option value="number">Número</option>
              <option value="height_weight">Altura + Peso</option>
            </select>
          </div>
          <div><label style={lbl}>Placeholder</label><input value={block.fieldPlaceholder || ''} onChange={e => onChange('fieldPlaceholder', e.target.value)} style={inp()}/></div>
        </>
      )}

      {/* Estilo do título */}
      <div style={{ borderTop: '1px solid #0f1a2e', paddingTop: '10px' }}>
        <label style={lbl}>Estilo do título</label>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input type="color" value={block.titleColor || '#eef2ff'} onChange={e => onChange('titleColor', e.target.value)} style={{ width: '28px', height: '28px', borderRadius: '5px', border: '1px solid #162035', background: 'none', cursor: 'pointer', padding: '1px' }}/>
          <button onClick={() => onChange('titleBold', !block.titleBold)} style={{ padding: '4px 8px', fontSize: '11px', fontWeight: '800', background: block.titleBold ? 'rgba(37,99,255,0.2)' : 'rgba(0,0,0,0.3)', border: `1px solid ${block.titleBold ? '#2563ff' : '#162035'}`, color: block.titleBold ? '#60a5fa' : '#4e6a90', borderRadius: '5px', cursor: 'pointer' }}>B</button>
          <select value={block.fontFamily || 'Syne, sans-serif'} onChange={e => onChange('fontFamily', e.target.value)} style={{ ...inp(), width: 'auto', fontSize: '10px', padding: '4px 8px' }}>
            <option value="Syne, sans-serif">Syne</option>
            <option value="DM Sans, sans-serif">DM Sans</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="monospace">Mono</option>
          </select>
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
    fetch('/api/page')
      .then(r => r.json())
      .then(({ pages }) => {
        const p = pages?.find((x: any) => x.id === id)
        if (p) {
          setPage(p)
          setBlocks(p.blocks_draft ?? p.blocks ?? [])
          setPageTitle(p.title ?? '')
          if (p.theme_draft || p.theme) {
            const t = p.theme_draft ?? p.theme
            const idx = THEMES.findIndex(th => th.name === t?.name)
            if (idx >= 0) setThemeIdx(idx)
          }
        }
      })
  }, [id])

  const salvar = async () => {
    setSalvando(true)
    const res = await fetch(`/api/page/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', blocks, theme: THEMES[themeIdx], title: pageTitle }),
    })
    setSalvando(false)
    if (res.ok) { setMsg('Salvo ✓'); setTimeout(() => setMsg(''), 2000) }
  }

  const publicar = async () => {
    await salvar()
    const res = await fetch(`/api/page/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish' }),
    })
    if (res.ok) { setPage((p: any) => ({ ...p, status: 'active' })); setMsg('Publicada! ✅'); setTimeout(() => setMsg(''), 3000) }
  }

  const despublicar = async () => {
    await fetch(`/api/page/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'unpublish' }) })
    setPage((p: any) => ({ ...p, status: 'draft' }))
  }

  const updateBlock = (field: string, value: any) => {
    if (!selectedId) return
    setBlocks(bs => bs.map(b => b.id === selectedId ? { ...b, [field]: value } : b))
  }

  const deleteBlock = (blockId: string) => {
    setBlocks(bs => bs.filter(b => b.id !== blockId))
    if (selectedId === blockId) setSelectedId(null)
  }

  const moveBlock = (blockId: string, dir: 'up' | 'down') => {
    const idx = blocks.findIndex(b => b.id === blockId)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === blocks.length - 1) return
    const nb = [...blocks]
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1
    ;[nb[idx], nb[targetIdx]] = [nb[targetIdx], nb[idx]]
    setBlocks(nb)
  }

  const addBlock = (partial: Partial<Block>) => {
    const nb = { ...partial, id: partial.id ?? `block-${Date.now()}` } as Block
    setBlocks(bs => [...bs, nb])
    setSelectedId(nb.id)
    setShowSidebar(false)
    setTimeout(() => {
      canvasRef.current?.scrollTo({ top: canvasRef.current.scrollHeight, behavior: 'smooth' })
    }, 100)
  }

  const isActive = page?.status === 'active'

  if (!page) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#05090f', color: '#4e6a90', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>
      Carregando editor...
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'DM Sans, sans-serif', background: '#05090f' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@300;400;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .canvas-block:hover { outline: 2px solid rgba(37,99,255,0.4) !important; outline-offset: 2px; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── PAINEL ESQUERDO: propriedades do bloco selecionado ── */}
      <div style={{ width: '260px', flexShrink: 0, background: '#0a1120', borderRight: '1px solid #162035', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header painel */}
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #0f1a2e' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '4px', letterSpacing: '-0.3px' }}>
            {selectedBlock ? `Editando: ${selectedBlock.label || selectedBlock.type}` : 'Selecione um bloco'}
          </div>
          {!selectedBlock && (
            <div style={{ fontSize: '11px', color: '#2e4560' }}>Clique em qualquer bloco no canvas para editar</div>
          )}
        </div>

        {/* Editor do bloco */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {selectedBlock ? (
            <BlockEditor block={selectedBlock} onChange={updateBlock}/>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>👆</div>
              <div style={{ fontSize: '12px', color: '#2e4560', lineHeight: 1.6 }}>Clique em um bloco no canvas para ver e editar suas propriedades aqui</div>
            </div>
          )}
        </div>

        {/* Footer painel */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid #0f1a2e' }}>
          <button onClick={() => router.push('/dashboard/pages')} style={{ background: 'none', border: 'none', color: '#4e6a90', fontSize: '11px', cursor: 'pointer', padding: 0 }}>← Voltar às páginas</button>
        </div>
      </div>

      {/* ── CANVAS CENTRAL ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <div style={{ height: '52px', background: '#0a1120', borderBottom: '1px solid #162035', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', flexShrink: 0 }}>
          <input
            value={pageTitle}
            onChange={e => setPageTitle(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#eef2ff', fontSize: '14px', fontWeight: '600', fontFamily: 'Syne, sans-serif', outline: 'none', flex: 1, letterSpacing: '-0.3px' }}
          />
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
            {msg && <span style={{ fontSize: '11px', color: msg.includes('Erro') ? '#f87171' : '#22c55e' }}>{msg}</span>}
            <button onClick={() => setShowThemes(!showThemes)} style={{ background: showThemes ? 'rgba(37,99,255,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${showThemes ? 'rgba(37,99,255,0.4)' : '#162035'}`, color: showThemes ? '#60a5fa' : '#4e6a90', fontSize: '11px', fontWeight: '600', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer' }}>🎨</button>
            <button onClick={salvar} disabled={salvando} style={{ background: '#0f1a2e', border: '1px solid #162035', color: '#4e6a90', fontSize: '11px', fontWeight: '600', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer' }}>
              {salvando ? '...' : '💾 Salvar'}
            </button>
            {isActive ? (
              <button onClick={despublicar} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5', fontSize: '11px', fontWeight: '600', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer' }}>Tirar do ar</button>
            ) : (
              <button onClick={publicar} style={{ background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontSize: '11px', fontWeight: '700', fontFamily: 'Syne, sans-serif', padding: '5px 12px', borderRadius: '7px', border: 'none', cursor: 'pointer', boxShadow: '0 0 12px rgba(37,99,255,0.3)' }}>⚡ Publicar</button>
            )}
          </div>
        </div>

        {/* Seletor de temas inline */}
        {showThemes && (
          <div style={{ background: '#0a1120', borderBottom: '1px solid #162035', padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>Tema:</span>
            {THEMES.map((t, i) => (
              <button key={t.name} onClick={() => { setThemeIdx(i); setShowThemes(false) }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '7px', border: `1.5px solid ${themeIdx === i ? t.accent : '#162035'}`, background: themeIdx === i ? `${t.accent}15` : 'rgba(0,0,0,0.2)', cursor: 'pointer' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: t.bg, border: `1px solid ${t.border}` }}/>
                <span style={{ fontSize: '11px', color: themeIdx === i ? t.accent2 : '#4e6a90', fontWeight: '600' }}>{t.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Canvas area */}
        <div
          ref={canvasRef}
          onClick={e => { if (e.target === e.currentTarget) setSelectedId(null) }}
          style={{ flex: 1, overflowY: 'auto', background: '#030508', padding: '24px', display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ width: '100%', maxWidth: '680px' }}>

            {/* Empty state */}
            {blocks.length === 0 && (
              <div
                onClick={() => setShowSidebar(true)}
                style={{ border: '2px dashed #162035', borderRadius: '16px', padding: '80px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,99,255,0.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,255,0.03)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#162035'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>+</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#4e6a90', marginBottom: '6px', fontFamily: 'Syne, sans-serif' }}>Clique para adicionar o primeiro bloco</div>
                <div style={{ fontSize: '13px', color: '#2e4560' }}>Escolha um componente da biblioteca</div>
              </div>
            )}

            {/* Blocos no canvas */}
            <div style={{ background: theme.bg, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 0 60px rgba(0,0,0,0.6)', border: `1px solid ${theme.border}` }}>
              {blocks.map((block, idx) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  theme={theme}
                  selected={selectedId === block.id}
                  onClick={() => setSelectedId(block.id === selectedId ? null : block.id)}
                  onDelete={() => deleteBlock(block.id)}
                  onMoveUp={() => moveBlock(block.id, 'up')}
                  onMoveDown={() => moveBlock(block.id, 'down')}
                  isFirst={idx === 0}
                  isLast={idx === blocks.length - 1}
                />
              ))}
            </div>

            {/* Botão + adicionar */}
            {blocks.length > 0 && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button
                  onClick={() => setShowSidebar(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37,99,255,0.07)', border: '1px dashed rgba(37,99,255,0.3)', color: '#60a5fa', fontSize: '13px', fontWeight: '600', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,255,0.13)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,255,0.07)' }}
                >
                  + Adicionar componente
                </button>
              </div>
            )}

            <div style={{ height: '60px' }}/>
          </div>
        </div>
      </div>

      {/* ── SIDEBAR DE COMPONENTES ── */}
      <ComponentsSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onAdd={addBlock}
      />
    </div>
  )
}