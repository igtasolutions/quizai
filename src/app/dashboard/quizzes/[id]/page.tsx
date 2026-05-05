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
  // estilo
  fontFamily?: string
  fontSize?: string
  titleColor?: string
  // imagem
  imageUrl?: string
  imageAlt?: string
  // vídeo
  videoProvider?: string
  videoUrl?: string
  videoEmbed?: string
  videoLockMinute?: number
  videoLockAction?: string
  // prova social
  testimonialPhoto?: string
  testimonialName?: string
  testimonialRole?: string
  testimonialText?: string
}

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
  const fileRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/quiz')
      .then(r => r.json())
      .then(({ quizzes }) => {
        const q = quizzes?.find((x: any) => x.id === id)
        if (q) { setQuiz(q); setBlocks(q.blocks ?? []) }
      })
  }, [id])

  const salvar = async (extraUpdates = {}) => {
    setSalvando(true)
    await fetch(`/api/quiz/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks, ...extraUpdates }),
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
    const newBlock: Block = {
      id: `manual-${Date.now()}`,
      type: 'manual',
      label: 'BLOCO MANUAL',
      title: 'Seu título aqui',
      subtitle: 'Escreva seu conteúdo aqui...',
      options: [],
    }
    setBlocks(bs => [...bs, newBlock])
    setEditando(newBlock.id)
  }

  const addVideoBlock = () => {
    const newBlock: Block = {
      id: `video-${Date.now()}`,
      type: 'video',
      label: 'VÍDEO',
      title: 'Assista ao vídeo completo',
      subtitle: '',
      options: [],
      videoProvider: 'youtube',
      videoLockMinute: 0,
      videoLockAction: 'show_button',
    }
    setBlocks(bs => [...bs, newBlock])
    setEditando(newBlock.id)
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

  if (!quiz) return <div style={{ padding: '40px', textAlign: 'center', color: '#4e6a90', fontFamily: 'DM Sans, sans-serif' }}>Carregando...</div>

  const isActive = quiz.status === 'active'

  return (
    <div style={{ padding: '28px 32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>{quiz.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: isActive ? '#22c55e' : '#4e6a90', boxShadow: isActive ? '0 0 8px rgba(34,197,94,0.6)' : 'none' }}/>
            <span style={{ fontSize: '11px', color: '#4e6a90' }}>{isActive ? 'Ativo' : 'Rascunho'}</span>
            {isActive && <span style={{ fontSize: '11px', color: '#60a5fa', fontFamily: 'monospace' }}>quizai.app/q/{quiz.slug}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {msg && <span style={{ fontSize: '12px', color: '#22c55e' }}>{msg}</span>}
          <button onClick={() => salvar()} disabled={salvando} style={{ background: '#0a1120', border: '1px solid #162035', color: '#4e6a90', fontSize: '12px', fontWeight: '600', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button onClick={publicar} style={{ background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontSize: '12px', fontWeight: '700', fontFamily: 'Syne, sans-serif', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 0 16px rgba(37,99,255,0.3)' }}>
            {isActive ? '✓ Publicado' : '⚡ Publicar'}
          </button>
        </div>
      </div>

      {/* LINK */}
      {isActive && (
        <div style={{ background: 'rgba(37,99,255,0.06)', border: '1px solid rgba(37,99,255,0.15)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Link do quiz</div>
            <div style={{ fontSize: '13px', color: '#60a5fa', fontFamily: 'monospace' }}>{typeof window !== 'undefined' ? window.location.origin : ''}/q/{quiz.slug}</div>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/q/${quiz.slug}`); setMsg('Copiado!') }} style={{ background: 'rgba(37,99,255,0.12)', border: '1px solid rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: '11px', fontWeight: '600', padding: '6px 14px', borderRadius: '7px', cursor: 'pointer' }}>
            Copiar
          </button>
        </div>
      )}

      {/* BOTÕES ADICIONAR */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button onClick={addManualBlock} style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24', fontSize: '11px', fontWeight: '600', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer' }}>
          + Bloco manual
        </button>
        <button onClick={addVideoBlock} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '11px', fontWeight: '600', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer' }}>
          + Bloco de vídeo
        </button>
      </div>

      <div style={{ fontSize: '11px', color: '#4e6a90', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ color: '#60a5fa' }}>⚡</span>
        {blocks.length} blocos · clique para editar
      </div>

      {/* BLOCOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {blocks.map((block) => {
          const colors = typeColors[block.type] ?? { bg: 'rgba(100,100,100,0.1)', text: '#888', border: 'rgba(100,100,100,0.2)' }
          const isEditing = editando === block.id
          const tab = getTab(block.id)

          return (
            <div key={block.id} style={{ background: '#0a1120', border: `1px solid ${isEditing ? 'rgba(37,99,255,0.4)' : '#162035'}`, borderRadius: '12px', overflow: 'hidden' }}>

              {/* HEADER DO BLOCO */}
              <div onClick={() => setEditando(isEditing ? null : block.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer' }}>
                <span style={{ color: '#4e6a90', fontSize: '14px' }}>⠿</span>
                <span style={{ fontSize: '9px', fontWeight: '700', padding: '3px 8px', borderRadius: '5px', textTransform: 'uppercase', letterSpacing: '0.5px', background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, flexShrink: 0 }}>
                  {block.type}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', color: '#4e6a90', marginBottom: '1px' }}>{block.label}</div>
                  <div style={{ fontSize: '13px', color: '#eef2ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {renderTitle(block.title)}
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteBlock(block.id) }} style={{ background: 'none', border: 'none', color: '#4e6a90', cursor: 'pointer', fontSize: '14px', padding: '4px 8px', borderRadius: '6px' }}>✕</button>
              </div>

              {/* EDITOR */}
              {isEditing && (
                <div style={{ borderTop: '1px solid #162035' }}>

                  {/* TABS */}
                  <div style={{ display: 'flex', gap: '2px', padding: '10px 16px 0', background: 'rgba(0,0,0,0.2)' }}>
                    {['conteudo', 'estilo', 'imagem', 'video', 'prova'].map(t => (
                      <button key={t} onClick={() => setTab(block.id, t)} style={{
                        padding: '6px 12px', fontSize: '10px', fontWeight: '600',
                        background: tab === t ? '#2563ff' : 'transparent',
                        color: tab === t ? '#fff' : '#4e6a90',
                        border: 'none', borderRadius: '6px 6px 0 0', cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>
                        {t === 'conteudo' ? 'Conteúdo' : t === 'estilo' ? 'Estilo' : t === 'imagem' ? 'Imagem' : t === 'video' ? 'Vídeo' : 'Prova Social'}
                      </button>
                    ))}
                  </div>

                  <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)' }}>

                    {/* TAB CONTEÚDO */}
                    {tab === 'conteudo' && (
                      <div>
                        <div style={sectionStyle}>
                          <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Título <span style={{ color: '#60a5fa', textTransform: 'none', letterSpacing: 0 }}>(*palavra* = azul)</span></label>
                            <textarea value={block.title} onChange={e => updateBlock(block.id, 'title', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'none' }}/>
                          </div>
                          <div style={{ marginBottom: '12px' }}>
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

                    {/* TAB ESTILO */}
                    {tab === 'estilo' && (
                      <div style={sectionStyle}>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={labelStyle}>Fonte</label>
                          <select value={block.fontFamily || 'Syne, sans-serif'} onChange={e => updateBlock(block.id, 'fontFamily', e.target.value)} style={{ ...inputStyle }}>
                            <option value="Syne, sans-serif">Syne (padrão)</option>
                            <option value="DM Sans, sans-serif">DM Sans</option>
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="monospace">Monospace</option>
                          </select>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
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
                            <input type="color" value={block.titleColor || '#eef2ff'} onChange={e => updateBlock(block.id, 'titleColor', e.target.value)} style={{ width: '44px', height: '36px', borderRadius: '6px', border: '1px solid #162035', background: 'none', cursor: 'pointer', padding: '2px' }}/>
                            <input value={block.titleColor || '#eef2ff'} onChange={e => updateBlock(block.id, 'titleColor', e.target.value)} placeholder="#eef2ff" style={{ ...inputStyle, flex: 1 }}/>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB IMAGEM */}
                    {tab === 'imagem' && (
                      <div>
                        <div style={sectionStyle}>
                          <label style={labelStyle}>Imagem do bloco (máx. 3MB · JPG, PNG, WebP, GIF)</label>
                          {block.imageUrl && (
                            <div style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #162035' }}>
                              <img src={block.imageUrl} alt="preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }}/>
                            </div>
                          )}
                          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(block.id, f, 'imageUrl') }}/>
                          <button onClick={() => fileRef.current?.click()} disabled={uploading === block.id} style={{ background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: '12px', fontWeight: '600', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
                            {uploading === block.id ? 'Enviando...' : block.imageUrl ? '🔄 Trocar imagem' : '📷 Fazer upload'}
                          </button>
                          {block.imageUrl && (
                            <button onClick={() => updateBlock(block.id, 'imageUrl', '')} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '11px', fontWeight: '600', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', width: '100%', marginTop: '8px' }}>
                              ✕ Remover imagem
                            </button>
                          )}
                        </div>
                        <div style={sectionStyle}>
                          <label style={labelStyle}>Texto alternativo (acessibilidade)</label>
                          <input value={block.imageAlt || ''} onChange={e => updateBlock(block.id, 'imageAlt', e.target.value)} placeholder="Descrição da imagem..." style={inputStyle}/>
                        </div>
                      </div>
                    )}

                    {/* TAB VÍDEO */}
                    {tab === 'video' && (
                      <div>
                        <div style={sectionStyle}>
                          <div style={{ marginBottom: '12px' }}>
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
                              <textarea value={block.videoEmbed || ''} onChange={e => updateBlock(block.id, 'videoEmbed', e.target.value)} rows={4} placeholder='<div id="vid_..."></div>&#10;<script src="..."></script>' style={{ ...inputStyle, resize: 'none', fontFamily: 'monospace', fontSize: '11px' }}/>
                            </div>
                          ) : (
                            <div>
                              <label style={labelStyle}>URL do vídeo</label>
                              <input value={block.videoUrl || ''} onChange={e => updateBlock(block.id, 'videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=..." style={inputStyle}/>
                            </div>
                          )}
                        </div>

                        <div style={sectionStyle}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#eef2ff', marginBottom: '12px' }}>⏱ Bloqueio de conteúdo</div>
                          <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Esconder botão "Continuar" até o minuto</label>
                            <select value={block.videoLockMinute ?? 0} onChange={e => updateBlock(block.id, 'videoLockMinute', Number(e.target.value))} style={{ ...inputStyle }}>
                              <option value={0}>Não bloquear</option>
                              <option value={1}>Minuto 1:00</option>
                              <option value={2}>Minuto 2:00</option>
                              <option value={3}>Minuto 3:00</option>
                              <option value={5}>Minuto 5:00</option>
                              <option value={7}>Minuto 7:00</option>
                              <option value={10}>Minuto 10:00</option>
                              <option value={15}>Minuto 15:00</option>
                              <option value={20}>Minuto 20:00</option>
                            </select>
                          </div>
                          {(block.videoLockMinute ?? 0) > 0 && (
                            <div>
                              <label style={labelStyle}>Quando liberar</label>
                              <select value={block.videoLockAction || 'show_button'} onChange={e => updateBlock(block.id, 'videoLockAction', e.target.value)} style={{ ...inputStyle }}>
                                <option value="show_button">Mostrar botão Continuar</option>
                                <option value="auto_next">Avançar automaticamente</option>
                              </select>
                            </div>
                          )}
                          {block.videoProvider === 'youtube' && (
                            <div style={{ marginTop: '12px', background: 'rgba(37,99,255,0.06)', border: '1px solid rgba(37,99,255,0.15)', borderRadius: '8px', padding: '10px 12px', fontSize: '11px', color: '#60a5fa' }}>
                              🛡️ Proteção YouTube ativa — o lead não consegue clicar no título nem ser redirecionado para o YouTube.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB PROVA SOCIAL */}
                    {tab === 'prova' && (
                      <div>
                        <div style={sectionStyle}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#eef2ff', marginBottom: '12px' }}>📸 Foto de perfil</div>
                          {block.testimonialPhoto && (
                            <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={block.testimonialPhoto} alt="foto" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(37,99,255,0.3)' }}/>
                              <span style={{ fontSize: '11px', color: '#4e6a90' }}>Foto carregada</span>
                            </div>
                          )}
                          <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(block.id, f, 'testimonialPhoto') }}/>
                          <button onClick={() => photoRef.current?.click()} disabled={uploading === block.id} style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac', fontSize: '11px', fontWeight: '600', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
                            {uploading === block.id ? 'Enviando...' : '📷 Upload da foto'}
                          </button>
                        </div>
                        <div style={sectionStyle}>
                          <div style={{ marginBottom: '10px' }}>
                            <label style={labelStyle}>Nome da pessoa</label>
                            <input value={block.testimonialName || ''} onChange={e => updateBlock(block.id, 'testimonialName', e.target.value)} placeholder="Ex: João Silva" style={inputStyle}/>
                          </div>
                          <div style={{ marginBottom: '10px' }}>
                            <label style={labelStyle}>Cargo / Nicho</label>
                            <input value={block.testimonialRole || ''} onChange={e => updateBlock(block.id, 'testimonialRole', e.target.value)} placeholder="Ex: Afiliado · Marketing Digital" style={inputStyle}/>
                          </div>
                          <div>
                            <label style={labelStyle}>Depoimento</label>
                            <textarea value={block.testimonialText || ''} onChange={e => updateBlock(block.id, 'testimonialText', e.target.value)} rows={3} placeholder='Ex: "Incrível, nunca imaginei que fosse tão fácil..."' style={{ ...inputStyle, resize: 'none' }}/>
                          </div>
                        </div>
                      </div>
                    )}

                    <button onClick={() => { setEditando(null); salvar() }} style={{ background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontSize: '12px', fontWeight: '700', fontFamily: 'Syne, sans-serif', padding: '9px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '4px' }}>
                      Salvar bloco
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '24px' }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: '#4e6a90', fontSize: '12px', cursor: 'pointer' }}>
          ← Voltar ao dashboard
        </button>
      </div>
    </div>
  )
}