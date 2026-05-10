'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface RichSection {
  id: string
  badge?: string
  number?: string
  numberLabel?: string
  title?: string
  text?: string
  listType?: string
  items?: string[]
  buttonEnabled?: boolean
  buttonText?: string
  buttonUrl?: string
  images?: string[]
  stars?: number
  testimonialPhoto?: string
  testimonialName?: string
  testimonialRole?: string
  testimonialText?: string
}

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
  titleBold?: boolean
  titleItalic?: boolean
  titleUnderline?: boolean
  subtitleFontFamily?: string
  subtitleFontSize?: string
  subtitleColor?: string
  subtitleBold?: boolean
  subtitleItalic?: boolean
  subtitleUnderline?: boolean
  imageUrl?: string
  imageAlt?: string
  galleryImages?: string[]
  videoProvider?: string
  videoUrl?: string
  videoEmbed?: string
  videoLockSeconds?: number
  videoLockAction?: string
  videoDuration?: number
  videoPitchSecond?: number
  testimonialPhoto?: string
  testimonialName?: string
  testimonialRole?: string
  testimonialText?: string
  testimonialStars?: number
  sections?: RichSection[]
}

interface Theme {
  name: string
  bg: string; surface: string; border: string
  accent: string; accent2: string; text: string; muted: string
}

const THEMES: Theme[] = [
  { name: 'Dark Azul',    bg: '#05090f', surface: '#0a1120', border: '#162035', accent: '#2563ff', accent2: '#60a5fa', text: '#eef2ff', muted: '#4e6a90' },
  { name: 'Dark Roxo',   bg: '#08050f', surface: '#120a20', border: '#1e1035', accent: '#7c3aed', accent2: '#a78bfa', text: '#f5f0ff', muted: '#6b5a90' },
  { name: 'Dark Verde',  bg: '#050f09', surface: '#0a2012', border: '#163520', accent: '#059669', accent2: '#34d399', text: '#f0fff4', muted: '#4e9070' },
  { name: 'Dark Vermelho', bg: '#0f0505', surface: '#200a0a', border: '#351616', accent: '#dc2626', accent2: '#f87171', text: '#fff5f5', muted: '#906060' },
  { name: 'Dark Dourado', bg: '#0f0e05', surface: '#201e0a', border: '#353216', accent: '#d97706', accent2: '#fbbf24', text: '#fffbf0', muted: '#907a40' },
  { name: 'Claro',       bg: '#f8fafc', surface: '#ffffff', border: '#e2e8f0', accent: '#2563ff', accent2: '#3b82f6', text: '#0f172a', muted: '#64748b' },
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
  rich:         { bg: 'rgba(16,185,129,0.1)',  text: '#6ee7b7', border: 'rgba(16,185,129,0.2)' },
}

const inp: React.CSSProperties = { width:'100%', background:'rgba(0,0,0,0.4)', border:'1px solid #162035', borderRadius:'8px', color:'#eef2ff', fontSize:'12px', padding:'9px 12px', outline:'none', boxSizing:'border-box', fontFamily:'DM Sans, sans-serif' }
const lbl: React.CSSProperties = { display:'block', fontSize:'10px', color:'#4e6a90', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'5px' }
const sec: React.CSSProperties = { background:'rgba(0,0,0,0.2)', border:'1px solid #162035', borderRadius:'10px', padding:'14px', marginBottom:'12px' }

function StyleControls({ prefix, block, updateBlock }: { prefix: string; block: Block; updateBlock: (id: string, field: string, value: any) => void }) {
  const fontKey = prefix === 'title' ? 'fontFamily' : 'subtitleFontFamily'
  const sizeKey = prefix === 'title' ? 'fontSize' : 'subtitleFontSize'
  const colorKey = prefix === 'title' ? 'titleColor' : 'subtitleColor'
  const boldKey = prefix === 'title' ? 'titleBold' : 'subtitleBold'
  const italicKey = prefix === 'title' ? 'titleItalic' : 'subtitleItalic'
  const underlineKey = prefix === 'title' ? 'titleUnderline' : 'subtitleUnderline'

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
      <select value={(block as any)[fontKey] || 'Syne, sans-serif'} onChange={e => updateBlock(block.id, fontKey, e.target.value)} style={{ ...inp, width: 'auto', fontSize: '10px', padding: '4px 8px' }}>
        <option value="Syne, sans-serif">Syne</option>
        <option value="DM Sans, sans-serif">DM Sans</option>
        <option value="Inter, sans-serif">Inter</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="monospace">Mono</option>
      </select>
      <select value={(block as any)[sizeKey] || (prefix === 'title' ? 'clamp(20px, 5vw, 28px)' : '14px')} onChange={e => updateBlock(block.id, sizeKey, e.target.value)} style={{ ...inp, width: 'auto', fontSize: '10px', padding: '4px 8px' }}>
        <option value="12px">12px</option>
        <option value="14px">14px</option>
        <option value="16px">16px</option>
        <option value="20px">20px</option>
        <option value="clamp(20px, 5vw, 28px)">Grande</option>
        <option value="clamp(24px, 6vw, 36px)">XL</option>
        <option value="clamp(28px, 7vw, 44px)">XXL</option>
      </select>
      <input type="color" value={(block as any)[colorKey] || '#eef2ff'} onChange={e => updateBlock(block.id, colorKey, e.target.value)} style={{ width: '28px', height: '28px', borderRadius: '5px', border: '1px solid #162035', background: 'none', cursor: 'pointer', padding: '1px' }}/>
      {[
        { key: boldKey, label: 'B', style: { fontWeight: '800' as const } },
        { key: italicKey, label: 'I', style: { fontStyle: 'italic' as const } },
        { key: underlineKey, label: 'U', style: { textDecoration: 'underline' as const } },
      ].map(({ key, label, style }) => (
        <button key={key} onClick={() => updateBlock(block.id, key, !(block as any)[key])} style={{ width: '28px', height: '28px', borderRadius: '5px', border: `1px solid ${(block as any)[key] ? '#2563ff' : '#162035'}`, background: (block as any)[key] ? 'rgba(37,99,255,0.2)' : 'rgba(0,0,0,0.3)', color: (block as any)[key] ? '#60a5fa' : '#4e6a90', cursor: 'pointer', fontSize: '11px', ...style }}>
          {label}
        </button>
      ))}
    </div>
  )
}

export default function EditarQuizPage() {
  const { id } = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<any>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [editando, setEditando] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Record<string, string>>({})
  const [salvando, setSalvando] = useState(false)
  const [publicando, setPublicando] = useState(false)
  const [msg, setMsg] = useState('')
  const [pixelId, setPixelId] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)
  const [showThemes, setShowThemes] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(0)
  const [customTheme, setCustomTheme] = useState<Theme>(THEMES[0])
  const [previewStep, setPreviewStep] = useState(0)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [sectionDrag, setSectionDrag] = useState<{ blockId: string; fromIdx: number } | null>(null)
  const [sectionDragOver, setSectionDragOver] = useState<{ blockId: string; toIdx: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const sectionFileRef = useRef<HTMLInputElement>(null)
  const galleryFileRef = useRef<HTMLInputElement>(null)
  const sectionPhotoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/quiz')
      .then(r => r.json())
      .then(({ quizzes }) => {
        const q = quizzes?.find((x: any) => x.id === id)
        if (q) {
          setQuiz(q)
          // Carrega rascunho se existir, senão carrega publicado
          setBlocks(q.blocks_draft ?? q.blocks ?? [])
          if (q.pixel_id) setPixelId(q.pixel_id)
          if (q.theme_draft || q.theme) {
            const t = q.theme_draft ?? q.theme
            const idx = THEMES.findIndex(th => th.name === t?.name)
            setSelectedTheme(idx >= 0 ? idx : 0)
            setCustomTheme(t)
          }
        }
      })
  }, [id])

  const currentTheme = selectedTheme === 6 ? customTheme : THEMES[selectedTheme]

  const salvar = async () => {
    setSalvando(true)
    const tema = selectedTheme === 6 ? customTheme : THEMES[selectedTheme]
    const res = await fetch(`/api/quiz/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        blocks,
        theme: tema,
        pixel_id: pixelId || null,
      }),
    })
    setSalvando(false)
    if (res.ok) { setMsg('Rascunho salvo ✓'); setTimeout(() => setMsg(''), 2000) }
    else setMsg('Erro ao salvar')
  }

  const publicar = async () => {
    setPublicando(true)
    // Primeiro salva o rascunho
    const tema = selectedTheme === 6 ? customTheme : THEMES[selectedTheme]
    await fetch(`/api/quiz/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', blocks, theme: tema, pixel_id: pixelId || null }),
    })
    // Depois publica
    const res = await fetch(`/api/quiz/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish' }),
    })
    setPublicando(false)
    if (res.ok) {
      setQuiz((q: any) => ({ ...q, status: 'active' }))
      setMsg('Publicado! ✅')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const despublicar = async () => {
    const res = await fetch(`/api/quiz/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unpublish' }),
    })
    if (res.ok) {
      setQuiz((q: any) => ({ ...q, status: 'draft' }))
      setMsg('Despublicado')
      setTimeout(() => setMsg(''), 2000)
    }
  }

  const updateBlock = (blockId: string, field: string, value: any) => {
    setBlocks(bs => bs.map(b => b.id === blockId ? { ...b, [field]: value } : b))
  }

  const updateOptions = (blockId: string, value: string) => {
    setBlocks(bs => bs.map(b => b.id === blockId ? { ...b, options: value.split('\n').filter(x => x.trim()) } : b))
  }

  const deleteBlock = (blockId: string) => {
    setBlocks(bs => bs.filter(b => b.id !== blockId))
    if (editando === blockId) setEditando(null)
  }

  const addSection = (blockId: string) => {
    const newSection: RichSection = { id: `sec-${Date.now()}`, title: '', text: '', listType: 'none', items: [], buttonEnabled: false, images: [], stars: 0 }
    setBlocks(bs => bs.map(b => b.id === blockId ? { ...b, sections: [...(b.sections ?? []), newSection] } : b))
  }

  const updateSection = (blockId: string, sectionId: string, field: string, value: any) => {
    setBlocks(bs => bs.map(b => b.id === blockId ? {
      ...b, sections: (b.sections ?? []).map(s => s.id === sectionId ? { ...s, [field]: value } : s)
    } : b))
  }

  const deleteSection = (blockId: string, sectionId: string) => {
    setBlocks(bs => bs.map(b => b.id === blockId ? { ...b, sections: (b.sections ?? []).filter(s => s.id !== sectionId) } : b))
  }

  const addRichBlock = () => {
    const nb: Block = {
      id: `rich-${Date.now()}`, type: 'rich', label: 'BLOCO RICO', title: 'Título principal', subtitle: '', options: [],
      titleBold: true, sections: [], galleryImages: [],
    }
    setBlocks(bs => [...bs, nb])
    setEditando(nb.id)
    setPreviewStep(blocks.length)
  }

  const uploadImage = async (blockId: string, file: File, field: string, sectionId?: string) => {
    setUploading(blockId)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const { url, error } = await res.json()
    if (error) { setMsg('Erro: ' + error); setUploading(null); return }
    if (sectionId) {
      if (field === 'images') {
        setBlocks(bs => bs.map(b => b.id === blockId ? {
          ...b, sections: (b.sections ?? []).map(s => s.id === sectionId ? { ...s, images: [...(s.images ?? []), url] } : s)
        } : b))
      } else {
        updateSection(blockId, sectionId, field, url)
      }
    } else if (field === 'galleryImages') {
      setBlocks(bs => bs.map(b => b.id === blockId ? { ...b, galleryImages: [...(b.galleryImages ?? []), url] } : b))
    } else {
      updateBlock(blockId, field, url)
    }
    setUploading(null)
    setMsg('Imagem enviada! ✓')
    setTimeout(() => setMsg(''), 2000)
  }

  const onDragStart = (idx: number) => setDragIdx(idx)
  const onDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOver(idx) }
  const onDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOver(null); return }
    const nb = [...blocks]
    const [moved] = nb.splice(dragIdx, 1)
    nb.splice(idx, 0, moved)
    setBlocks(nb)
    setDragIdx(null); setDragOver(null)
  }
  const onDragEnd = () => { setDragIdx(null); setDragOver(null) }

  const renderTitle = (text: string) => {
    const parts = text.split(/\*([^*]+)\*/)
    return parts.map((part, i) => i % 2 === 1 ? <span key={i} style={{ color: '#60a5fa' }}>{part}</span> : <span key={i}>{part}</span>)
  }

  const getTab = (blockId: string) => activeTab[blockId] || 'conteudo'
  const setTab = (blockId: string, tab: string) => setActiveTab(prev => ({ ...prev, [blockId]: tab }))

  const previewBlock = blocks[previewStep]
  if (!quiz) return <div style={{ padding: '40px', textAlign: 'center', color: '#4e6a90', fontFamily: 'DM Sans, sans-serif' }}>Carregando...</div>
  const isActive = quiz.status === 'active'
  const hasDraft = true // sempre tem rascunho

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>

      {/* EDITOR */}
      <div style={{ flex: 1, padding: '24px 20px', maxWidth: '580px', overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>{quiz.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#22c55e' : '#4e6a90', boxShadow: isActive ? '0 0 6px #22c55e' : 'none' }}/>
              <span style={{ fontSize: '11px', color: isActive ? '#22c55e' : '#4e6a90' }}>{isActive ? 'Publicado' : 'Rascunho'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {msg && <span style={{ fontSize: '11px', color: msg.includes('Erro') ? '#f87171' : '#22c55e' }}>{msg}</span>}
            <button onClick={() => setShowThemes(!showThemes)} style={{ background: showThemes ? 'rgba(37,99,255,0.15)' : '#0a1120', border: `1px solid ${showThemes ? 'rgba(37,99,255,0.4)' : '#162035'}`, color: showThemes ? '#60a5fa' : '#4e6a90', fontSize: '11px', fontWeight: '600', padding: '6px 12px', borderRadius: '7px', cursor: 'pointer' }}>🎨 Tema</button>
            <button onClick={salvar} disabled={salvando} style={{ background: '#0a1120', border: '1px solid #162035', color: '#4e6a90', fontSize: '11px', fontWeight: '600', padding: '6px 12px', borderRadius: '7px', cursor: 'pointer' }}>
              {salvando ? 'Salvando...' : '💾 Salvar'}
            </button>
            {isActive ? (
              <button onClick={despublicar} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5', fontSize: '11px', fontWeight: '600', padding: '6px 12px', borderRadius: '7px', cursor: 'pointer' }}>
                ✓ Publicado · Tirar do ar
              </button>
            ) : (
              <button onClick={publicar} disabled={publicando} style={{ background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontSize: '11px', fontWeight: '700', fontFamily: 'Syne, sans-serif', padding: '6px 12px', borderRadius: '7px', border: 'none', cursor: 'pointer', boxShadow: '0 0 12px rgba(37,99,255,0.3)' }}>
                {publicando ? 'Publicando...' : '⚡ Publicar'}
              </button>
            )}
          </div>
        </div>

        {/* PIXEL POR QUIZ */}
        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid #162035', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>🎯 Pixel FB</span>
          <input value={pixelId} onChange={e => setPixelId(e.target.value)} placeholder="ID do Pixel do Facebook deste quiz" style={{ flex: 1, background: 'transparent', border: 'none', color: '#eef2ff', fontSize: '12px', outline: 'none', fontFamily: 'monospace' }}/>
        </div>

        {/* LINK */}
        {isActive && (
          <div style={{ background: 'rgba(37,99,255,0.06)', border: '1px solid rgba(37,99,255,0.15)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '11px', color: '#60a5fa', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {typeof window !== 'undefined' ? window.location.origin : ''}/q/{quiz.slug}
            </div>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/q/${quiz.slug}`); setMsg('Copiado!') }} style={{ background: 'rgba(37,99,255,0.12)', border: '1px solid rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: '10px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', flexShrink: 0, marginLeft: '8px' }}>Copiar</button>
          </div>
        )}

        {/* TEMAS */}
        {showThemes && (
          <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '12px' }}>🎨 Tema do quiz</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '12px' }}>
              {THEMES.map((t, i) => (
                <div key={t.name} onClick={() => setSelectedTheme(i)} style={{ cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${selectedTheme === i ? currentTheme.accent : '#162035'}`, transition: 'all 0.2s' }}>
                  <div style={{ background: t.bg, padding: '8px', height: '52px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ width: '55%', height: '5px', borderRadius: '2px', background: t.accent }}/>
                    <div style={{ width: '80%', height: '7px', borderRadius: '3px', background: t.accent, opacity: 0.7 }}/>
                  </div>
                  <div style={{ background: t.surface, padding: '3px', textAlign: 'center', fontSize: '8px', fontWeight: '600', color: t.text }}>{t.name}</div>
                </div>
              ))}
            </div>
            {selectedTheme === 6 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                {[{ key: 'bg', label: 'Fundo' }, { key: 'surface', label: 'Cards' }, { key: 'accent', label: 'Cor primária' }, { key: 'accent2', label: 'Secundária' }, { key: 'text', label: 'Texto' }, { key: 'border', label: 'Bordas' }].map(({ key, label }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <input type="color" value={(customTheme as any)[key]} onChange={e => setCustomTheme(prev => ({ ...prev, name: 'Personalizado', [key]: e.target.value }))} style={{ width: '32px', height: '28px', borderRadius: '5px', border: '1px solid #162035', background: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}/>
                    <span style={{ fontSize: '10px', color: '#4e6a90' }}>{label}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={salvar} style={{ marginTop: '10px', width: '100%', background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accent}cc)`, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '12px', padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
              Salvar tema no rascunho
            </button>
          </div>
        )}

        {/* BOTÃO ADICIONAR */}
        <div style={{ marginBottom: '12px' }}>
          <button onClick={addRichBlock} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7', fontSize: '11px', fontWeight: '600', padding: '7px 16px', borderRadius: '7px', cursor: 'pointer' }}>
            + Adicionar bloco
          </button>
        </div>

        <div style={{ fontSize: '10px', color: '#4e6a90', marginBottom: '10px' }}>
          <span style={{ color: '#60a5fa' }}>⚡</span> {blocks.length} blocos · arraste ⠿ para reordenar
        </div>

        {/* BLOCOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {blocks.map((block, idx) => {
            const colors = typeColors[block.type] ?? { bg: 'rgba(100,100,100,0.1)', text: '#888', border: 'rgba(100,100,100,0.2)' }
            const isEditing = editando === block.id
            const isDragging = dragIdx === idx
            const isOver = dragOver === idx
            const tab = getTab(block.id)

            return (
              <div key={block.id} draggable onDragStart={() => onDragStart(idx)} onDragOver={e => onDragOver(e, idx)} onDrop={e => onDrop(e, idx)} onDragEnd={onDragEnd}
                style={{ background: '#0a1120', border: `1px solid ${isEditing ? 'rgba(37,99,255,0.4)' : isOver ? 'rgba(37,99,255,0.3)' : '#162035'}`, borderRadius: '10px', overflow: 'hidden', opacity: isDragging ? 0.4 : 1, transform: isOver && !isDragging ? 'translateY(-2px)' : 'none' }}>

                <div onClick={() => { setEditando(isEditing ? null : block.id); setPreviewStep(idx) }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', cursor: 'pointer' }}>
                  <span style={{ color: '#4e6a90', fontSize: '14px', cursor: 'grab' }}>⠿</span>
                  <span style={{ fontSize: '8px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, flexShrink: 0 }}>{block.type}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '9px', color: '#4e6a90', marginBottom: '1px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{block.label}</div>
                    <div style={{ fontSize: '11px', color: '#eef2ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{renderTitle(block.title)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <span style={{ fontSize: '10px', color: '#4e6a90' }}>{idx + 1}</span>
                    <button onClick={e => { e.stopPropagation(); deleteBlock(block.id) }} style={{ background: 'none', border: 'none', color: '#4e6a90', cursor: 'pointer', fontSize: '12px', padding: '2px 6px' }}>✕</button>
                  </div>
                </div>

                {isEditing && (
                  <div style={{ borderTop: '1px solid #162035' }}>
                    <div style={{ display: 'flex', gap: '2px', padding: '6px 12px 0', background: 'rgba(0,0,0,0.2)', flexWrap: 'wrap' }}>
                      {['conteudo', 'imagens', 'video', 'prova', 'secoes'].map(t => (
                        <button key={t} onClick={() => setTab(block.id, t)} style={{ padding: '4px 9px', fontSize: '9px', fontWeight: '600', background: tab === t ? '#2563ff' : 'transparent', color: tab === t ? '#fff' : '#4e6a90', border: 'none', borderRadius: '4px 4px 0 0', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {t === 'conteudo' ? 'Conteúdo' : t === 'imagens' ? 'Imagens' : t === 'video' ? 'Vídeo' : t === 'prova' ? 'Prova Social' : 'Seções'}
                        </button>
                      ))}
                    </div>

                    <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)' }}>

                      {tab === 'conteudo' && (
                        <div>
                          <div style={sec}>
                            <div style={{ marginBottom: '12px' }}>
                              <label style={lbl}>Título <span style={{ color: '#60a5fa', textTransform: 'none', letterSpacing: 0 }}>(*palavra* = brilho)</span></label>
                              <textarea value={block.title} onChange={e => updateBlock(block.id, 'title', e.target.value)} rows={2} style={{ ...inp, resize: 'none' }}/>
                              <StyleControls prefix="title" block={block} updateBlock={updateBlock}/>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                              <label style={lbl}>Subtítulo / Texto</label>
                              <textarea value={block.subtitle} onChange={e => updateBlock(block.id, 'subtitle', e.target.value)} rows={3} style={{ ...inp, resize: 'none' }}/>
                              <StyleControls prefix="subtitle" block={block} updateBlock={updateBlock}/>
                            </div>
                            <div>
                              <label style={lbl}>Label da etapa</label>
                              <input value={block.label} onChange={e => updateBlock(block.id, 'label', e.target.value)} style={inp}/>
                            </div>
                          </div>
                          {block.options && block.options.length > 0 && (
                            <div style={sec}>
                              <label style={lbl}>Opções (uma por linha)</label>
                              <textarea value={block.options.join('\n')} onChange={e => updateOptions(block.id, e.target.value)} rows={block.options.length + 1} style={{ ...inp, resize: 'none' }}/>
                            </div>
                          )}
                        </div>
                      )}

                      {tab === 'imagens' && (
                        <div>
                          <div style={sec}>
                            <label style={lbl}>Imagem principal</label>
                            {block.imageUrl && (
                              <div style={{ marginBottom: '8px', borderRadius: '7px', overflow: 'hidden', border: '1px solid #162035', position: 'relative' }}>
                                <img src={block.imageUrl} alt="preview" style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', display: 'block' }}/>
                                <button onClick={() => updateBlock(block.id, 'imageUrl', '')} style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer' }}>✕</button>
                              </div>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(block.id, f, 'imageUrl') }}/>
                            <button onClick={() => fileRef.current?.click()} disabled={uploading === block.id} style={{ background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: '11px', fontWeight: '600', padding: '7px 12px', borderRadius: '7px', cursor: 'pointer', width: '100%' }}>
                              {uploading === block.id ? 'Enviando...' : block.imageUrl ? '🔄 Trocar' : '📷 Upload'}
                            </button>
                          </div>
                          <div style={sec}>
                            <label style={lbl}>Galeria de imagens</label>
                            {(block.galleryImages ?? []).map((img, gi) => (
                              <div key={gi} style={{ marginBottom: '8px', borderRadius: '7px', overflow: 'hidden', border: '1px solid #162035', position: 'relative' }}>
                                <img src={img} alt="" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', display: 'block' }}/>
                                <button onClick={() => updateBlock(block.id, 'galleryImages', (block.galleryImages ?? []).filter((_, i) => i !== gi))} style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer' }}>✕</button>
                              </div>
                            ))}
                            <input ref={galleryFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(block.id, f, 'galleryImages') }}/>
                            <button onClick={() => galleryFileRef.current?.click()} disabled={uploading === block.id} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7', fontSize: '11px', fontWeight: '600', padding: '7px 12px', borderRadius: '7px', cursor: 'pointer', width: '100%' }}>
                              {uploading === block.id ? 'Enviando...' : '+ Adicionar imagem à galeria'}
                            </button>
                          </div>
                        </div>
                      )}

                      {tab === 'video' && (
                        <div>
                          <div style={sec}>
                            <div style={{ marginBottom: '10px' }}>
                              <label style={lbl}>Plataforma</label>
                              <select value={block.videoProvider || 'youtube'} onChange={e => updateBlock(block.id, 'videoProvider', e.target.value)} style={{ ...inp }}>
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
                                <label style={lbl}>Código HTML do Vturb</label>
                                <textarea value={block.videoEmbed || ''} onChange={e => updateBlock(block.id, 'videoEmbed', e.target.value)} rows={4} placeholder={'<div id="vid_..."></div>\n<script src="..."></script>'} style={{ ...inp, resize: 'none', fontFamily: 'monospace', fontSize: '10px' }}/>
                              </div>
                            ) : (
                              <div>
                                <label style={lbl}>URL do vídeo</label>
                                <input value={block.videoUrl || ''} onChange={e => updateBlock(block.id, 'videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=..." style={inp}/>
                              </div>
                            )}
                          </div>
                          <div style={sec}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#eef2ff', marginBottom: '10px' }}>⏱ Bloqueio de conteúdo</div>
                            <div style={{ marginBottom: '10px' }}>
                              <label style={lbl}>Esconder "Continuar" até o segundo</label>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="number" min={0} value={block.videoLockSeconds ?? 0} onChange={e => updateBlock(block.id, 'videoLockSeconds', Number(e.target.value))} placeholder="Ex: 825 = 13min 45s" style={{ ...inp, flex: 1 }}/>
                                <div style={{ fontSize: '10px', color: '#4e6a90', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                  {(block.videoLockSeconds ?? 0) > 0 ? `${Math.floor((block.videoLockSeconds ?? 0) / 60)}min ${(block.videoLockSeconds ?? 0) % 60}s` : 'não bloquear'}
                                </div>
                              </div>
                            </div>
                            {(block.videoLockSeconds ?? 0) > 0 && (
                              <div style={{ marginBottom: '10px' }}>
                                <label style={lbl}>Quando liberar</label>
                                <select value={block.videoLockAction || 'show_button'} onChange={e => updateBlock(block.id, 'videoLockAction', e.target.value)} style={{ ...inp }}>
                                  <option value="show_button">Mostrar botão Continuar</option>
                                  <option value="auto_next">Avançar automaticamente</option>
                                </select>
                              </div>
                            )}
                            {block.videoProvider === 'youtube' && <div style={{ background: 'rgba(37,99,255,0.06)', border: '1px solid rgba(37,99,255,0.15)', borderRadius: '7px', padding: '8px 10px', fontSize: '10px', color: '#60a5fa' }}>🛡️ Proteção YouTube ativa</div>}
                          </div>
                          <div style={sec}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#eef2ff', marginBottom: '10px' }}>📊 Analytics do vídeo</div>
                            <div style={{ marginBottom: '10px' }}>
                              <label style={lbl}>Duração total (segundos)</label>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="number" min={0} value={block.videoDuration ?? 0} onChange={e => updateBlock(block.id, 'videoDuration', Number(e.target.value))} placeholder="Ex: 600 = 10min" style={{ ...inp, flex: 1 }}/>
                                <div style={{ fontSize: '10px', color: '#4e6a90', flexShrink: 0 }}>{(block.videoDuration ?? 0) > 0 ? `${Math.floor((block.videoDuration ?? 0) / 60)}min` : ''}</div>
                              </div>
                            </div>
                            <div>
                              <label style={lbl}>Segundo do pitch</label>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="number" min={0} value={block.videoPitchSecond ?? 0} onChange={e => updateBlock(block.id, 'videoPitchSecond', Number(e.target.value))} placeholder="Ex: 540 = 9min" style={{ ...inp, flex: 1 }}/>
                                <div style={{ fontSize: '10px', color: '#4e6a90', flexShrink: 0 }}>{(block.videoPitchSecond ?? 0) > 0 ? `${Math.floor((block.videoPitchSecond ?? 0) / 60)}min` : ''}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {tab === 'prova' && (
                        <div>
                          <div style={sec}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#eef2ff', marginBottom: '10px' }}>⭐ Avaliação</div>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                              {[1,2,3,4,5].map(star => (
                                <button key={star} onClick={() => updateBlock(block.id, 'testimonialStars', star === block.testimonialStars ? 0 : star)} style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer', color: star <= (block.testimonialStars ?? 0) ? '#fbbf24' : '#4e6a90' }}>★</button>
                              ))}
                            </div>
                          </div>
                          <div style={sec}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#eef2ff', marginBottom: '8px' }}>📸 Foto de perfil</div>
                            {block.testimonialPhoto && (
                              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img src={block.testimonialPhoto} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(37,99,255,0.3)' }}/>
                                <button onClick={() => updateBlock(block.id, 'testimonialPhoto', '')} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '10px', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer' }}>✕ Remover</button>
                              </div>
                            )}
                            <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(block.id, f, 'testimonialPhoto') }}/>
                            <button onClick={() => photoRef.current?.click()} disabled={uploading === block.id} style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac', fontSize: '10px', fontWeight: '600', padding: '7px 12px', borderRadius: '7px', cursor: 'pointer', width: '100%' }}>
                              {uploading === block.id ? 'Enviando...' : '📷 Upload da foto'}
                            </button>
                          </div>
                          <div style={sec}>
                            <div style={{ marginBottom: '8px' }}><label style={lbl}>Nome</label><input value={block.testimonialName || ''} onChange={e => updateBlock(block.id, 'testimonialName', e.target.value)} placeholder="João Silva" style={inp}/></div>
                            <div style={{ marginBottom: '8px' }}><label style={lbl}>Cargo / Nicho</label><input value={block.testimonialRole || ''} onChange={e => updateBlock(block.id, 'testimonialRole', e.target.value)} placeholder="Afiliado · Marketing Digital" style={inp}/></div>
                            <div><label style={lbl}>Depoimento</label><textarea value={block.testimonialText || ''} onChange={e => updateBlock(block.id, 'testimonialText', e.target.value)} rows={3} style={{ ...inp, resize: 'none' }}/></div>
                          </div>
                        </div>
                      )}

                      {tab === 'secoes' && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#4e6a90', marginBottom: '10px' }}>
                            Monte seções dentro do bloco — títulos, textos, listas, botões e imagens.
                          </div>
                          {(block.sections ?? []).map((section, sidx) => (
                            <div
                              key={section.id}
                              draggable
                              onDragStart={() => setSectionDrag({ blockId: block.id, fromIdx: sidx })}
                              onDragOver={e => { e.preventDefault(); setSectionDragOver({ blockId: block.id, toIdx: sidx }) }}
                              onDrop={e => {
                                e.preventDefault()
                                if (!sectionDrag || sectionDrag.blockId !== block.id) return
                                const { fromIdx } = sectionDrag
                                const toIdx = sidx
                                if (fromIdx === toIdx) { setSectionDrag(null); setSectionDragOver(null); return }
                                setBlocks(bs => bs.map(b => {
                                  if (b.id !== block.id) return b
                                  const secs = [...(b.sections ?? [])]
                                  const [moved] = secs.splice(fromIdx, 1)
                                  secs.splice(toIdx, 0, moved)
                                  return { ...b, sections: secs }
                                }))
                                setSectionDrag(null); setSectionDragOver(null)
                              }}
                              onDragEnd={() => { setSectionDrag(null); setSectionDragOver(null) }}
                              style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: `1px solid ${sectionDragOver?.blockId === block.id && sectionDragOver?.toIdx === sidx ? 'rgba(37,99,255,0.4)' : '#1e3050'}`,
                                borderRadius: '10px', padding: '12px', marginBottom: '10px',
                                opacity: sectionDrag?.blockId === block.id && sectionDrag?.fromIdx === sidx ? 0.4 : 1,
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ color: '#4e6a90', fontSize: '14px', cursor: 'grab' }}>⠿</span>
                                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#60a5fa', textTransform: 'uppercase' }}>Seção {sidx + 1}</span>
                                </div>
                                <button onClick={() => deleteSection(block.id, section.id)} style={{ background: 'none', border: 'none', color: '#4e6a90', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div>
                                  <label style={lbl}>Badge (ex: RECOMENDADO)</label>
                                  <input value={section.badge || ''} onChange={e => updateSection(block.id, section.id, 'badge', e.target.value)} placeholder="RECOMENDADO" style={inp}/>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                  <div>
                                    <label style={lbl}>Número grande</label>
                                    <input value={section.number || ''} onChange={e => updateSection(block.id, section.id, 'number', e.target.value)} placeholder="01" style={inp}/>
                                  </div>
                                  <div>
                                    <label style={lbl}>Label do número</label>
                                    <input value={section.numberLabel || ''} onChange={e => updateSection(block.id, section.id, 'numberLabel', e.target.value)} placeholder="CAMINHO" style={inp}/>
                                  </div>
                                </div>
                                <div>
                                  <label style={lbl}>Título da seção</label>
                                  <input value={section.title || ''} onChange={e => updateSection(block.id, section.id, 'title', e.target.value)} placeholder="Título desta seção" style={inp}/>
                                </div>
                                <div>
                                  <label style={lbl}>Texto / Descrição</label>
                                  <textarea value={section.text || ''} onChange={e => updateSection(block.id, section.id, 'text', e.target.value)} rows={2} style={{ ...inp, resize: 'none' }}/>
                                </div>
                                <div>
                                  <label style={lbl}>Tipo de lista</label>
                                  <select value={section.listType || 'none'} onChange={e => updateSection(block.id, section.id, 'listType', e.target.value)} style={{ ...inp }}>
                                    <option value="none">Sem lista</option>
                                    <option value="check">✓ Lista positiva (verde)</option>
                                    <option value="cross">✕ Lista negativa (vermelho)</option>
                                  </select>
                                </div>
                                {section.listType !== 'none' && (
                                  <div>
                                    <label style={lbl}>Itens (Enter = nova linha)</label>
                                    <textarea
                                      value={(section.items ?? []).join('\n')}
                                      onChange={e => updateSection(block.id, section.id, 'items', e.target.value.split('\n'))}
                                      rows={Math.max(3, (section.items ?? []).length + 1)}
                                      placeholder={'Item 1\nItem 2\nItem 3'}
                                      style={{ ...inp, resize: 'vertical' }}
                                    />
                                  </div>
                                )}
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <div onClick={() => updateSection(block.id, section.id, 'buttonEnabled', !section.buttonEnabled)} style={{ width: '32px', height: '18px', borderRadius: '9px', background: section.buttonEnabled ? '#2563ff' : '#162035', position: 'relative', flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s' }}>
                                      <div style={{ position: 'absolute', top: '3px', left: section.buttonEnabled ? '15px' : '3px', width: '12px', height: '12px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }}/>
                                    </div>
                                    <label style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }} onClick={() => updateSection(block.id, section.id, 'buttonEnabled', !section.buttonEnabled)}>Habilitar botão</label>
                                  </div>
                                  {section.buttonEnabled && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                      <div>
                                        <label style={lbl}>Texto do botão</label>
                                        <input value={section.buttonText || ''} onChange={e => updateSection(block.id, section.id, 'buttonText', e.target.value)} placeholder="Quero destravar →" style={inp}/>
                                      </div>
                                      <div>
                                        <label style={lbl}>Link do botão</label>
                                        <input value={section.buttonUrl || ''} onChange={e => updateSection(block.id, section.id, 'buttonUrl', e.target.value)} placeholder="https://..." style={inp}/>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label style={lbl}>Imagens da seção</label>
                                  {(section.images ?? []).map((img, imgIdx) => (
                                    <div key={imgIdx} style={{ marginBottom: '6px', borderRadius: '6px', overflow: 'hidden', position: 'relative', border: '1px solid #162035' }}>
                                      <img src={img} alt="" style={{ width: '100%', maxHeight: '100px', objectFit: 'cover', display: 'block' }}/>
                                      <button onClick={() => updateSection(block.id, section.id, 'images', (section.images ?? []).filter((_, i) => i !== imgIdx))} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', fontSize: '10px', padding: '2px 7px', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                                    </div>
                                  ))}
                                  <input ref={sectionFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(block.id, f, 'images', section.id) }}/>
                                  <button onClick={() => sectionFileRef.current?.click()} disabled={uploading === block.id} style={{ background: 'rgba(37,99,255,0.08)', border: '1px solid rgba(37,99,255,0.15)', color: '#60a5fa', fontSize: '10px', fontWeight: '600', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>
                                    {uploading === block.id ? 'Enviando...' : '+ Adicionar imagem'}
                                  </button>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px', border: '1px solid #162035' }}>
                                  <label style={{ ...lbl, marginBottom: '8px' }}>Prova social da seção</label>
                                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                                    {[1,2,3,4,5].map(star => (
                                      <button key={star} onClick={() => updateSection(block.id, section.id, 'stars', star === section.stars ? 0 : star)} style={{ fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', color: star <= (section.stars ?? 0) ? '#fbbf24' : '#4e6a90' }}>★</button>
                                    ))}
                                  </div>
                                  <div style={{ marginBottom: '6px' }}><label style={lbl}>Nome</label><input value={section.testimonialName || ''} onChange={e => updateSection(block.id, section.id, 'testimonialName', e.target.value)} placeholder="João Silva" style={inp}/></div>
                                  <div style={{ marginBottom: '6px' }}><label style={lbl}>Cargo</label><input value={section.testimonialRole || ''} onChange={e => updateSection(block.id, section.id, 'testimonialRole', e.target.value)} placeholder="Afiliado" style={inp}/></div>
                                  <div style={{ marginBottom: '6px' }}><label style={lbl}>Depoimento</label><textarea value={section.testimonialText || ''} onChange={e => updateSection(block.id, section.id, 'testimonialText', e.target.value)} rows={2} style={{ ...inp, resize: 'none' }}/></div>
                                  <div>
                                    <label style={lbl}>Foto</label>
                                    {section.testimonialPhoto && (
                                      <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <img src={section.testimonialPhoto} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}/>
                                        <button onClick={() => updateSection(block.id, section.id, 'testimonialPhoto', '')} style={{ background: 'none', border: 'none', color: '#fca5a5', fontSize: '10px', cursor: 'pointer' }}>✕ remover</button>
                                      </div>
                                    )}
                                    <input ref={sectionPhotoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(block.id, f, 'testimonialPhoto', section.id) }}/>
                                    <button onClick={() => sectionPhotoRef.current?.click()} disabled={uploading === block.id} style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac', fontSize: '10px', fontWeight: '600', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>
                                      📷 Upload foto
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          <button onClick={() => addSection(block.id)} style={{ width: '100%', background: 'rgba(16,185,129,0.08)', border: '1px dashed rgba(16,185,129,0.3)', color: '#6ee7b7', fontSize: '11px', fontWeight: '600', padding: '9px', borderRadius: '8px', cursor: 'pointer' }}>
                            + Adicionar seção
                          </button>
                        </div>
                      )}

                      <button onClick={() => { setEditando(null); salvar() }} style={{ background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontSize: '11px', fontWeight: '700', fontFamily: 'Syne, sans-serif', padding: '7px 16px', borderRadius: '7px', border: 'none', cursor: 'pointer', marginTop: '8px' }}>
                        Salvar bloco
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '16px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: '#4e6a90', fontSize: '11px', cursor: 'pointer' }}>← Voltar ao dashboard</button>
        </div>
      </div>

      {/* PREVIEW */}
      <div style={{ width: '300px', flexShrink: 0, background: '#030508', borderLeft: '1px solid #162035', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #162035', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📱 Preview</div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button onClick={() => setPreviewStep(Math.max(0, previewStep - 1))} disabled={previewStep === 0} style={{ background: '#0a1120', border: '1px solid #162035', color: '#4e6a90', fontSize: '10px', padding: '3px 7px', borderRadius: '4px', cursor: 'pointer' }}>←</button>
            <span style={{ fontSize: '10px', color: '#4e6a90', padding: '3px 6px' }}>{previewStep + 1}/{blocks.length}</span>
            <button onClick={() => setPreviewStep(Math.min(blocks.length - 1, previewStep + 1))} disabled={previewStep >= blocks.length - 1} style={{ background: '#0a1120', border: '1px solid #162035', color: '#4e6a90', fontSize: '10px', padding: '3px 7px', borderRadius: '4px', cursor: 'pointer' }}>→</button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '14px' }}>
          <div style={{ width: '248px', background: currentTheme.bg, borderRadius: '18px', border: `2px solid ${currentTheme.border}`, overflow: 'hidden', boxShadow: '0 0 24px rgba(0,0,0,0.5)' }}>
            <div style={{ background: currentTheme.surface, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${currentTheme.border}` }}>
              <span style={{ fontSize: '9px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: currentTheme.text }}>Quiz<span style={{ color: currentTheme.accent2 }}>AI</span></span>
              <div style={{ flex: 1, margin: '0 8px', height: '2px', background: currentTheme.border, borderRadius: '1px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((previewStep + 1) / Math.max(blocks.length, 1)) * 100}%`, background: `linear-gradient(90deg, ${currentTheme.accent}, ${currentTheme.accent2})`, borderRadius: '1px', transition: 'width 0.3s' }}/>
              </div>
              <span style={{ fontSize: '8px', color: currentTheme.muted }}>{previewStep + 1}/{blocks.length}</span>
            </div>

            {previewBlock && (
              <div style={{ padding: '14px' }}>
                <div style={{ fontSize: '8px', letterSpacing: '1px', color: currentTheme.accent2, textTransform: 'uppercase', marginBottom: '8px' }}>{previewBlock.label}</div>
                <div style={{ background: currentTheme.surface, border: `1px solid ${currentTheme.border}`, borderRadius: '9px', padding: '10px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: previewBlock.titleColor || currentTheme.text, fontFamily: previewBlock.fontFamily || 'Syne, sans-serif', marginBottom: '5px' }}>
                    {previewBlock.title.replace(/\*([^*]+)\*/g, '$1')}
                  </div>
                  {previewBlock.subtitle && <div style={{ fontSize: '9px', color: currentTheme.muted }}>{String(previewBlock.subtitle ?? '').substring(0, 60)}...</div>}
                  {previewBlock.imageUrl && <div style={{ marginTop: '7px', borderRadius: '5px', overflow: 'hidden' }}><img src={previewBlock.imageUrl} alt="" style={{ width: '100%', maxHeight: '70px', objectFit: 'cover', display: 'block' }}/></div>}
                  {previewBlock.sections?.slice(0, 2).map((s: RichSection) => (
                    <div key={s.id} style={{ marginTop: '6px', padding: '6px', background: 'rgba(0,0,0,0.2)', borderRadius: '5px' }}>
                      {s.badge && <div style={{ fontSize: '7px', color: currentTheme.accent, fontWeight: '700' }}>{s.badge}</div>}
                      {s.title && <div style={{ fontSize: '9px', fontWeight: '700', color: currentTheme.text }}>{s.title}</div>}
                    </div>
                  ))}
                </div>
                {previewBlock.options?.slice(0, 2).map((opt: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 7px', borderRadius: '5px', border: `1px solid ${currentTheme.border}`, background: currentTheme.surface, marginBottom: '3px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: `1px solid ${currentTheme.muted}`, flexShrink: 0 }}/>
                    <span style={{ fontSize: '8px', color: currentTheme.text }}>{String(opt ?? '').substring(0, 25)}</span>
                  </div>
                ))}
                <div style={{ width: '100%', background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accent}cc)`, color: '#fff', fontSize: '9px', fontWeight: '700', padding: '8px', borderRadius: '6px', textAlign: 'center', marginTop: '6px', fontFamily: 'Syne, sans-serif' }}>
                  {previewBlock.type === 'capture' ? 'Ver meu diagnóstico →' : previewBlock.type === 'offer' ? 'Quero agora →' : 'Continuar →'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}