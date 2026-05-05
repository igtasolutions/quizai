'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Block {
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

interface Theme {
  name: string
  bg: string
  surface: string
  border: string
  accent: string
  accent2: string
  text: string
  muted: string
}

const THEMES: Theme[] = [
  { name: 'Dark Azul', bg: '#05090f', surface: '#0a1120', border: '#162035', accent: '#2563ff', accent2: '#60a5fa', text: '#eef2ff', muted: '#4e6a90' },
  { name: 'Dark Roxo', bg: '#08050f', surface: '#120a20', border: '#1e1035', accent: '#7c3aed', accent2: '#a78bfa', text: '#f5f0ff', muted: '#6b5a90' },
  { name: 'Dark Verde', bg: '#050f09', surface: '#0a2012', border: '#163520', accent: '#059669', accent2: '#34d399', text: '#f0fff4', muted: '#4e9070' },
  { name: 'Dark Vermelho', bg: '#0f0505', surface: '#200a0a', border: '#351616', accent: '#dc2626', accent2: '#f87171', text: '#fff5f5', muted: '#906060' },
  { name: 'Dark Dourado', bg: '#0f0e05', surface: '#201e0a', border: '#353216', accent: '#d97706', accent2: '#fbbf24', text: '#fffbf0', muted: '#907a40' },
  { name: 'Claro', bg: '#f8fafc', surface: '#ffffff', border: '#e2e8f0', accent: '#2563ff', accent2: '#3b82f6', text: '#0f172a', muted: '#64748b' },
  { name: 'Personalizado', bg: '#05090f', surface: '#0a1120', border: '#162035', accent: '#2563ff', accent2: '#60a5fa', text: '#eef2ff', muted: '#4e6a90' },
]

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  headline:     { bg: 'rgba(124,58,237,0.1)',  text: '#c4b5fd', border: 'rgba(124,58,237,0.2)' },
  question:     { bg: 'rgba(37,99,255,0.1)',   text: '#60a5fa', border: 'rgba(37,99,255,0.2)' },
  insight:      { bg: 'rgba(234,179,8,0.1)',   text: '#fde047', border: 'rgba(234,179,8,0.2)' },
  capture:      { bg: 'rgba(236,72,153,0.1)',  text: '#f9a8d4', border: 'rgba(236,72,153,0.2)' },
  offer:        { bg: 'rgba(249,115,22,0.1)',  text: '#fdba74', border: 'rgba(249,115,22,0.2)' },
  bridge:       { bg: 'rgba(20,184,166,0.1)',  text: '#5eead4', border: 'rgba(20,184,166,0.2)' },
  social_proof: { bg: 'rgba(34,197,94,0.1)',   text: '#86efac', border: 'rgba(34,197,94,0.2)' },
  manual:       { bg: 'rgba(251,191,36,0.1)',  text: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
  video:        { bg: 'rgba(239,68,68,0.1)',   text: '#fca5a5', border: 'rgba(239,68,68,0.2)' },
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #162035',
  borderRadius: '8px', color: '#eef2ff', fontSize: '12px', padding: '9px 12px',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '10px', color: '#4e6a90',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px',
}

const sectionStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.2)', border: '1px solid #162035',
  borderRadius: '10px', padding: '14px', marginBottom: '12px',
}

export default function EditarQuizPage() {
  const { id } = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<any>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [editando, setEditando] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Record<string, string>>({})
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)
  const [showThemes, setShowThemes] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(0)
  const [customTheme, setCustomTheme] = useState<Theme>(THEMES[0])
  const [previewStep, setPreviewStep] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/quiz')
      .then(r => r.json())
      .then(({ quizzes }) => {
        const q = quizzes?.find((x: any) => x.id === id)
        if (q) {
          setQuiz(q)
          setBlocks(q.blocks ?? [])
          if (q.theme) {
            const idx = THEMES.findIndex(t => t.name === q.theme?.name)
            if (idx >= 0) setSelectedTheme(idx)
            setCustomTheme(q.theme)
          }
        }
      })
  }, [id])

  const currentTheme = selectedTheme === 6 ? customTheme : THEMES[selectedTheme]

  const salvar = async (extraUpdates = {}) => {
    setSalvando(true)
    await fetch(`/api/quiz/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks, theme: currentTheme, ...extraUpdates }),
    })
    setSalvando(false)
    setMsg('Salvo! ✓')
    setTimeout(() => setMsg(''), 2000)
  }

  const publicar = async () => {
    await salvar({ status: 'active' })
    setQuiz((q: any) => ({ ...q, status: 'active' }))
    setMsg('Publicado! ✅')
  }

  const updateBlock = (blockId: string, field: string, value: any) => {
    setBlocks(bs => bs.map(b => b.id === blockId ? { ...b, [field]: value } : b))
  }

  const updateOptions = (blockId: string, value: string) => {
    setBlocks(bs => bs.map(b => b.id === blockId ? { ...b, options: value.split('\n').filter(x => x.trim()) } : b))
  }

  const deleteBlock = (blockId: string) => {
    setBlocks(bs => bs.filter(b => b.id !== blockId))
  }

  const addManualBlock = () => {
    const nb: Block = { id: `manual-${Date.now()}`, type: 'manual', label: 'BLOCO MANUAL', title: 'Seu título aqui', subtitle: 'Escreva seu conteúdo aqui...', options: [] }
    setBlocks(bs => [...bs, nb])
    setEditando(nb.id)
  }

  const addVideoBlock = () => {
    const nb: Block = { id: `video-${Date.now()}`, type: 'video', label: 'VÍDEO', title: 'Assista ao vídeo completo', subtitle: '', options: [], videoProvider: 'youtube', videoLockSeconds: 0, videoLockAction: 'show_button' }
    setBlocks(bs => [...bs, nb])
    setEditando(nb.id)
  }

  const uploadImage = async (blockId: string, file: File, field: string) => {
    setUploading(blockId)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const { url, error } = await res.json()
    if (error) { setMsg('Erro: ' + error); setUploading(null); return }
    updateBlock(blockId, field, url)
    setUploading(null)
    setMsg('Imagem enviada! ✓')
    setTimeout(() => setMsg(''), 2000)
  }

  const renderTitle = (text: string) => {
    const parts = text.split(/\*([^*]+)\*/)
    return parts.map((part, i) =>
      i % 2 === 1 ? <span key={i} style={{ color: '#60a5fa' }}>{part}</span> : <span key={i}>{part}</span>
    )
  }

  const getTab = (blockId: string) => activeTab[blockId] || 'conteudo'
  const setTab = (blockId: string, tab: string) => setActiveTab(prev => ({ ...prev, [blockId]: tab }))

  const previewBlock = blocks[previewStep]

  if (!quiz) return <div style={{ padding: '40px', textAlign: 'center', color: '#4e6a90', fontFamily: 'DM Sans, sans-serif' }}>Carregando...</div>

  const isActive = quiz.status === 'active'

  return (
    <div style={{ display: 'flex', gap: '0', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>

      {/* EDITOR — lado esquerdo */}
      <div style={{ flex: 1, padding: '28px 24px', maxWidth: '600px', overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', margin: '0 0 5px', letterSpacing: '-0.5px' }}>{quiz.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: isActive ? '#22c55e' : '#4e6a90', boxShadow: isActive ? '0 0 8px rgba(34,197,94,0.6)' : 'none' }}/>
              <span style={{ fontSize: '11px', color: '#4e6a90' }}>{isActive ? 'Ativo' : 'Rascunho'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {msg && <span style={{ fontSize: '11px', color: '#22c55e' }}>{msg}</span>}
            <button onClick={() => setShowThemes(!showThemes)} style={{ background: showThemes ? 'rgba(37,99,255,0.15)' : '#0a1120', border: `1px solid ${showThemes ? 'rgba(37,99,255,0.4)' : '#162035'}`, color: showThemes ? '#60a5fa' : '#4e6a90', fontSize: '11px', fontWeight: '600', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer' }}>
              🎨 Tema
            </button>
            <button onClick={() => salvar()} disabled={salvando} style={{ background: '#0a1120', border: '1px solid #162035', color: '#4e6a90', fontSize: '11px', fontWeight: '600', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer' }}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={publicar} style={{ background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontSize: '11px', fontWeight: '700', fontFamily: 'Syne, sans-serif', padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 0 14px rgba(37,99,255,0.3)' }}>
              {isActive ? '✓ Publicado' : '⚡ Publicar'}
            </button>
          </div>
        </div>

        {/* LINK */}
        {isActive && (
          <div style={{ background: 'rgba(37,99,255,0.06)', border: '1px solid rgba(37,99,255,0.15)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '11px', color: '#60a5fa', fontFamily: 'monospace' }}>{typeof window !== 'undefined' ? window.location.origin : ''}/q/{quiz.slug}</div>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/q/${quiz.slug}`); setMsg('Copiado!') }} style={{ background: 'rgba(37,99,255,0.12)', border: '1px solid rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: '10px', fontWeight: '600', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}>
              Copiar
            </button>
          </div>
        )}

        {/* PAINEL DE TEMAS */}
        {showThemes && (
          <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '14px' }}>🎨 Tema do quiz</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {THEMES.map((t, i) => (
                <div key={t.name} onClick={() => setSelectedTheme(i)} style={{ cursor: 'pointer', borderRadius: '10px', overflow: 'hidden', border: `2px solid ${selectedTheme === i ? currentTheme.accent : '#162035'}`, transition: 'all 0.2s', boxShadow: selectedTheme === i ? `0 0 14px ${currentTheme.accent}40` : 'none' }}>
                  <div style={{ background: t.bg, padding: '10px', height: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ width: '60%', height: '6px', borderRadius: '3px', background: t.accent }}/>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: t.surface, border: `1px solid ${t.border}` }}/>
                      <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: t.surface, border: `1px solid ${t.border}` }}/>
                    </div>
                    <div style={{ width: '80%', height: '8px', borderRadius: '4px', background: t.accent, opacity: 0.8 }}/>
                  </div>
                  <div style={{ background: t.surface, padding: '4px', textAlign: 'center', fontSize: '9px', fontWeight: '600', color: t.text }}>
                    {t.name}
                  </div>
                </div>
              ))}
            </div>

            {/* PERSONALIZADO */}
            {selectedTheme === 6 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '14px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid #162035' }}>
                {[
                  { key: 'bg', label: 'Fundo' },
                  { key: 'surface', label: 'Cards' },
                  { key: 'accent', label: 'Cor primária' },
                  { key: 'accent2', label: 'Cor secundária' },
                  { key: 'text', label: 'Texto' },
                  { key: 'border', label: 'Bordas' },
                ].map(({ key, label }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="color" value={(customTheme as any)[key]} onChange={e => setCustomTheme(prev => ({ ...prev, [key]: e.target.value }))} style={{ width: '36px', height: '32px', borderRadius: '6px', border: '1px solid #162035', background: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}/>
                    <span style={{ fontSize: '11px', color: '#4e6a90' }}>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOTÕES ADICIONAR */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <button onClick={addManualBlock} style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24', fontSize: '11px', fontWeight: '600', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer' }}>
            + Bloco manual
          </button>
          <button onClick={addVideoBlock} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '11px', fontWeight: '600', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer' }}>
            + Bloco de vídeo
          </button>
        </div>

        <div style={{ fontSize: '11px', color: '#4e6a90', marginBottom: '10px' }}>
          <span style={{ color: '#60a5fa' }}>⚡</span> {blocks.length} blocos · clique para editar
        </div>

        {/* BLOCOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {blocks.map((block, idx) => {
            const colors = typeColors[block.type] ?? { bg: 'rgba(100,100,100,0.1)', text: '#888', border: 'rgba(100,100,100,0.2)' }
            const isEditing = editando === block.id
            const tab = getTab(block.id)

            return (
              <div key={block.id} style={{ background: '#0a1120', border: `1px solid ${isEditing ? 'rgba(37,99,255,0.4)' : '#162035'}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div onClick={() => { setEditando(isEditing ? null : block.id); setPreviewStep(idx) }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', cursor: 'pointer' }}>
                  <span style={{ color: '#4e6a90', fontSize: '12px' }}>⠿</span>
                  <span style={{ fontSize: '9px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, flexShrink: 0 }}>
                    {block.type}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '9px', color: '#4e6a90', marginBottom: '1px' }}>{block.label}</div>
                    <div style={{ fontSize: '12px', color: '#eef2ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {renderTitle(block.title)}
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteBlock(block.id) }} style={{ background: 'none', border: 'none', color: '#4e6a90', cursor: 'pointer', fontSize: '13px', padding: '3px 7px', borderRadius: '5px' }}>✕</button>
                </div>

                {isEditing && (
                  <div style={{ borderTop: '1px solid #162035' }}>
                    {/* TABS */}
                    <div style={{ display: 'flex', gap: '2px', padding: '8px 14px 0', background: 'rgba(0,0,0,0.2)' }}>
                      {['conteudo', 'estilo', 'imagem', 'video', 'prova'].map(t => (
                        <button key={t} onClick={() => setTab(block.id, t)} style={{ padding: '5px 10px', fontSize: '10px', fontWeight: '600', background: tab === t ? '#2563ff' : 'transparent', color: tab === t ? '#fff' : '#4e6a90', border: 'none', borderRadius: '5px 5px 0 0', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {t === 'conteudo' ? 'Conteúdo' : t === 'estilo' ? 'Estilo' : t === 'imagem' ? 'Imagem' : t === 'video' ? 'Vídeo' : 'Prova Social'}
                        </button>
                      ))}
                    </div>

                    <div style={{ padding: '14px', background: 'rgba(0,0,0,0.3)' }}>

                      {/* CONTEÚDO */}
                      {tab === 'conteudo' && (
                        <div>
                          <div style={sectionStyle}>
                            <div style={{ marginBottom: '10px' }}>
                              <label style={labelStyle}>Título <span style={{ color: '#60a5fa', textTransform: 'none', letterSpacing: 0 }}>(*palavra* = brilho azul)</span></label>
                              <textarea value={block.title} onChange={e => updateBlock(block.id, 'title', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'none' }}/>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                              <label style={labelStyle}>Subtítulo / Texto</label>
                              <textarea value={block.subtitle} onChange={e => updateBlock(block.id, 'subtitle', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'none' }}/>
                            </div>
                            <div>
                              <label style={labelStyle}>Label da etapa</label>
                              <input value={block.label} onChange={e => updateBlock(block.id, 'label', e.target.value)} style={inputStyle}/>
                            </div>
                          </div>
                          {block.options && block.options.length > 0 && (
                            <div style={sectionStyle}>
                              <label style={labelStyle}>Opções (uma por linha)</label>
                              <textarea value={block.options.join('\n')} onChange={e => updateOptions(block.id, e.target.value)} rows={block.options.length + 1} style={{ ...inputStyle, resize: 'none' }}/>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ESTILO */}
                      {tab === 'estilo' && (
                        <div style={sectionStyle}>
                          <div style={{ marginBottom: '10px' }}>
                            <label style={labelStyle}>Fonte</label>
                            <select value={block.fontFamily || 'Syne, sans-serif'} onChange={e => updateBlock(block.id, 'fontFamily', e.target.value)} style={{ ...inputStyle }}>
                              <option value="Syne, sans-serif">Syne (padrão)</option>
                              <option value="DM Sans, sans-serif">DM Sans</option>
                              <option value="Inter, sans-serif">Inter</option>
                              <option value="Georgia, serif">Georgia</option>
                              <option value="monospace">Monospace</option>
                            </select>
                          </div>
                          <div style={{ marginBottom: '10px' }}>
                            <label style={labelStyle}>Tamanho do título</label>
                            <select value={block.fontSize || 'clamp(20px, 5vw, 28px)'} onChange={e => updateBlock(block.id, 'fontSize', e.target.value)} style={{ ...inputStyle }}>
                              <option value="16px">Pequeno (16px)</option>
                              <option value="20px">Médio (20px)</option>
                              <option value="clamp(20px, 5vw, 28px)">Grande (padrão)</option>
                              <option value="clamp(24px, 6vw, 36px)">Muito grande (36px)</option>
                              <option value="clamp(28px, 7vw, 44px)">Gigante (44px)</option>
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>Cor do título</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="color" value={block.titleColor || '#eef2ff'} onChange={e => updateBlock(block.id, 'titleColor', e.target.value)} style={{ width: '40px', height: '34px', borderRadius: '6px', border: '1px solid #162035', background: 'none', cursor: 'pointer', padding: '2px' }}/>
                              <input value={block.titleColor || '#eef2ff'} onChange={e => updateBlock(block.id, 'titleColor', e.target.value)} placeholder="#eef2ff" style={{ ...inputStyle, flex: 1 }}/>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* IMAGEM */}
                      {tab === 'imagem' && (
                        <div>
                          <div style={sectionStyle}>
                            <label style={labelStyle}>Imagem do bloco (máx. 3MB · JPG, PNG, WebP, GIF)</label>
                            {block.imageUrl && (
                              <div style={{ marginBottom: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #162035' }}>
                                <img src={block.imageUrl} alt="preview" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', display: 'block' }}/>
                              </div>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(block.id, f, 'imageUrl') }}/>
                            <button onClick={() => fileRef.current?.click()} disabled={uploading === block.id} style={{ background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: '12px', fontWeight: '600', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
                              {uploading === block.id ? 'Enviando...' : block.imageUrl ? '🔄 Trocar imagem' : '📷 Fazer upload'}
                            </button>
                            {block.imageUrl && (
                              <button onClick={() => updateBlock(block.id, 'imageUrl', '')} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '11px', fontWeight: '600', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', width: '100%', marginTop: '8px' }}>
                                ✕ Remover imagem
                              </button>
                            )}
                          </div>
                          <div style={sectionStyle}>
                            <label style={labelStyle}>Texto alternativo</label>
                            <input value={block.imageAlt || ''} onChange={e => updateBlock(block.id, 'imageAlt', e.target.value)} placeholder="Descrição da imagem..." style={inputStyle}/>
                          </div>
                        </div>
                      )}

                      {/* VÍDEO */}
                      {tab === 'video' && (
                        <div>
                          <div style={sectionStyle}>
                            <div style={{ marginBottom: '10px' }}>
                              <label style={labelStyle}>Plataforma</label>
                              <select value={block.videoProvider || 'youtube'} onChange={e => updateBlock(block.id, 'videoProvider', e.target.value)} style={{ ...inputStyle }}>
                                <option value="youtube">YouTube</option>
                                <option value="vturb">Vturb (VSL)</option>
                                <option value="vimeo">Vimeo</option>
                                <option value="panda">Panda Video</option>
                                <option value="kwik">Kwik</option>
                                <option value="iframe">Outro (iframe)</option>
                              </select>
                            </div>
                            {block.videoProvider === 'vturb' ? (
                              <div>
                                <label style={labelStyle}>Código HTML do Vturb</label>
                                <textarea value={block.videoEmbed || ''} onChange={e => updateBlock(block.id, 'videoEmbed', e.target.value)} rows={4} placeholder={'<div id="vid_..."></div>\n<script src="..."></script>'} style={{ ...inputStyle, resize: 'none', fontFamily: 'monospace', fontSize: '11px' }}/>
                              </div>
                            ) : (
                              <div>
                                <label style={labelStyle}>URL do vídeo</label>
                                <input value={block.videoUrl || ''} onChange={e => updateBlock(block.id, 'videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=..." style={inputStyle}/>
                              </div>
                            )}
                          </div>
                          <div style={sectionStyle}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#eef2ff', marginBottom: '10px' }}>⏱ Bloqueio de conteúdo</div>
                            <div style={{ marginBottom: '10px' }}>
                              <label style={labelStyle}>Esconder botão "Continuar" até o segundo</label>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type="number" min={0}
                                  value={block.videoLockSeconds ?? 0}
                                  onChange={e => updateBlock(block.id, 'videoLockSeconds', Number(e.target.value))}
                                  placeholder="Ex: 825 (= 13min 45s)"
                                  style={{ ...inputStyle, flex: 1 }}
                                />
                                <div style={{ fontSize: '11px', color: '#4e6a90', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                  {(block.videoLockSeconds ?? 0) > 0
                                    ? `= ${Math.floor((block.videoLockSeconds ?? 0) / 60)}min ${(block.videoLockSeconds ?? 0) % 60}s`
                                    : '0 = não bloquear'}
                                </div>
                              </div>
                            </div>
                            {(block.videoLockSeconds ?? 0) > 0 && (
                              <div>
                                <label style={labelStyle}>Quando liberar</label>
                                <select value={block.videoLockAction || 'show_button'} onChange={e => updateBlock(block.id, 'videoLockAction', e.target.value)} style={{ ...inputStyle }}>
                                  <option value="show_button">Mostrar botão Continuar</option>
                                  <option value="auto_next">Avançar automaticamente</option>
                                </select>
                              </div>
                            )}
                            {block.videoProvider === 'youtube' && (
                              <div style={{ marginTop: '10px', background: 'rgba(37,99,255,0.06)', border: '1px solid rgba(37,99,255,0.15)', borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: '#60a5fa' }}>
                                🛡️ Proteção YouTube ativa — o lead não consegue ser redirecionado para o YouTube.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* PROVA SOCIAL */}
                      {tab === 'prova' && (
                        <div>
                          <div style={sectionStyle}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#eef2ff', marginBottom: '10px' }}>📸 Foto de perfil</div>
                            {block.testimonialPhoto && (
                              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src={block.testimonialPhoto} alt="foto" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(37,99,255,0.3)' }}/>
                                <span style={{ fontSize: '11px', color: '#4e6a90' }}>Foto carregada</span>
                              </div>
                            )}
                            <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(block.id, f, 'testimonialPhoto') }}/>
                            <button onClick={() => photoRef.current?.click()} disabled={uploading === block.id} style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac', fontSize: '11px', fontWeight: '600', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
                              {uploading === block.id ? 'Enviando...' : '📷 Upload da foto'}
                            </button>
                          </div>
                          <div style={sectionStyle}>
                            <div style={{ marginBottom: '8px' }}>
                              <label style={labelStyle}>Nome</label>
                              <input value={block.testimonialName || ''} onChange={e => updateBlock(block.id, 'testimonialName', e.target.value)} placeholder="Ex: João Silva" style={inputStyle}/>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <label style={labelStyle}>Cargo / Nicho</label>
                              <input value={block.testimonialRole || ''} onChange={e => updateBlock(block.id, 'testimonialRole', e.target.value)} placeholder="Ex: Afiliado · Marketing Digital" style={inputStyle}/>
                            </div>
                            <div>
                              <label style={labelStyle}>Depoimento</label>
                              <textarea value={block.testimonialText || ''} onChange={e => updateBlock(block.id, 'testimonialText', e.target.value)} rows={3} placeholder='"Incrível, nunca imaginei que fosse tão fácil..."' style={{ ...inputStyle, resize: 'none' }}/>
                            </div>
                          </div>
                        </div>
                      )}

                      <button onClick={() => { setEditando(null); salvar() }} style={{ background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontSize: '11px', fontWeight: '700', fontFamily: 'Syne, sans-serif', padding: '8px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer', marginTop: '4px' }}>
                        Salvar bloco
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '20px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: '#4e6a90', fontSize: '12px', cursor: 'pointer' }}>
            ← Voltar ao dashboard
          </button>
        </div>
      </div>

      {/* PREVIEW — lado direito */}
      <div style={{ width: '320px', flexShrink: 0, background: '#030508', borderLeft: '1px solid #162035', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #162035', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '11px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📱 Preview</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setPreviewStep(Math.max(0, previewStep - 1))} disabled={previewStep === 0} style={{ background: '#0a1120', border: '1px solid #162035', color: '#4e6a90', fontSize: '10px', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer' }}>←</button>
            <span style={{ fontSize: '10px', color: '#4e6a90', padding: '4px 8px' }}>{previewStep + 1}/{blocks.length}</span>
            <button onClick={() => setPreviewStep(Math.min(blocks.length - 1, previewStep + 1))} disabled={previewStep >= blocks.length - 1} style={{ background: '#0a1120', border: '1px solid #162035', color: '#4e6a90', fontSize: '10px', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer' }}>→</button>
          </div>
        </div>

        {/* PHONE FRAME */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '260px', background: currentTheme.bg, borderRadius: '20px', border: `2px solid ${currentTheme.border}`, overflow: 'hidden', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}>
            {/* STATUS BAR */}
            <div style={{ background: currentTheme.surface, padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${currentTheme.border}` }}>
              <span style={{ fontSize: '9px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: currentTheme.text }}>
                Quiz<span style={{ color: currentTheme.accent2 }}>AI</span>
              </span>
              <div style={{ flex: 1, margin: '0 8px', height: '2px', background: `${currentTheme.border}`, borderRadius: '1px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((previewStep + 1) / blocks.length) * 100}%`, background: `linear-gradient(90deg, ${currentTheme.accent}, ${currentTheme.accent2})`, borderRadius: '1px', transition: 'width 0.3s' }}/>
              </div>
              <span style={{ fontSize: '8px', color: currentTheme.muted }}>{previewStep + 1}/{blocks.length}</span>
            </div>

            {/* CONTEÚDO PREVIEW */}
            {previewBlock && (
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '8px', letterSpacing: '1px', color: currentTheme.accent2, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: currentTheme.accent2 }}/>
                  {previewBlock.label}
                </div>

                <div style={{ background: currentTheme.surface, border: `1px solid ${currentTheme.border}`, borderRadius: '10px', padding: '12px', marginBottom: '10px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: `radial-gradient(circle, ${currentTheme.accent}20 0%, transparent 70%)`, pointerEvents: 'none' }}/>
                  <div style={{ fontSize: '12px', fontWeight: '800', lineHeight: '1.3', color: previewBlock.titleColor || currentTheme.text, fontFamily: previewBlock.fontFamily || 'Syne, sans-serif', marginBottom: '6px' }}>
                    {previewBlock.title.replace(/\*([^*]+)\*/g, '$1')}
                  </div>
                  {previewBlock.subtitle && (
                    <div style={{ fontSize: '9px', color: currentTheme.muted, lineHeight: '1.4' }}>
                      {previewBlock.subtitle.substring(0, 80)}{previewBlock.subtitle.length > 80 ? '...' : ''}
                    </div>
                  )}
                  {previewBlock.imageUrl && (
                    <div style={{ marginTop: '8px', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src={previewBlock.imageUrl} alt="" style={{ width: '100%', maxHeight: '80px', objectFit: 'cover', display: 'block' }}/>
                    </div>
                  )}
                </div>

                {previewBlock.options && previewBlock.options.slice(0, 3).map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 9px', borderRadius: '7px', border: `1px solid ${currentTheme.border}`, background: currentTheme.surface, marginBottom: '5px' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: `1px solid ${currentTheme.muted}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', color: currentTheme.muted }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span style={{ fontSize: '9px', color: currentTheme.text }}>{opt.substring(0, 30)}{opt.length > 30 ? '...' : ''}</span>
                  </div>
                ))}

                <div style={{ width: '100%', background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accent}cc)`, color: '#fff', fontSize: '10px', fontWeight: '700', padding: '10px', borderRadius: '8px', textAlign: 'center', marginTop: '8px', fontFamily: 'Syne, sans-serif' }}>
                  {previewBlock.type === 'capture' ? 'Ver meu diagnóstico →' : previewBlock.type === 'offer' ? 'Quero meu plano agora →' : 'Continuar →'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}