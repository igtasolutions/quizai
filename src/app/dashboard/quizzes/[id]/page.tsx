'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Block {
  id: string
  type: string
  label: string
  title: string
  subtitle: string
  options: string[]
}

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  headline:     { bg: 'rgba(124,58,237,0.1)',  text: '#c4b5fd', border: 'rgba(124,58,237,0.2)' },
  question:     { bg: 'rgba(37,99,255,0.1)',   text: '#60a5fa', border: 'rgba(37,99,255,0.2)' },
  insight:      { bg: 'rgba(234,179,8,0.1)',   text: '#fde047', border: 'rgba(234,179,8,0.2)' },
  capture:      { bg: 'rgba(236,72,153,0.1)',  text: '#f9a8d4', border: 'rgba(236,72,153,0.2)' },
  offer:        { bg: 'rgba(249,115,22,0.1)',  text: '#fdba74', border: 'rgba(249,115,22,0.2)' },
  bridge:       { bg: 'rgba(20,184,166,0.1)',  text: '#5eead4', border: 'rgba(20,184,166,0.2)' },
  social_proof: { bg: 'rgba(34,197,94,0.1)',   text: '#86efac', border: 'rgba(34,197,94,0.2)' },
}

export default function EditarQuizPage() {
  const { id } = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<any>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [editando, setEditando] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')

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

  const updateBlock = (blockId: string, field: string, value: string) => {
    setBlocks(bs => bs.map(b => b.id === blockId ? { ...b, [field]: value } : b))
  }

  const updateOptions = (blockId: string, value: string) => {
    setBlocks(bs => bs.map(b => b.id === blockId ? { ...b, options: value.split('\n').filter(x => x.trim()) } : b))
  }

  const deleteBlock = (blockId: string) => {
    setBlocks(bs => bs.filter(b => b.id !== blockId))
  }

  const renderTitle = (text: string) => {
    const parts = text.split(/\*([^*]+)\*/)
    return parts.map((part, i) =>
      i % 2 === 1 ? <span key={i} style={{ color: '#60a5fa' }}>{part}</span> : <span key={i}>{part}</span>
    )
  }

  if (!quiz) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#4e6a90', fontFamily: 'DM Sans, sans-serif' }}>
      Carregando...
    </div>
  )

  const isActive = quiz.status === 'active'

  return (
    <div style={{ padding: '28px 32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            {quiz.title}
          </h1>
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
            <div style={{ fontSize: '13px', color: '#60a5fa', fontFamily: 'monospace' }}>
              {window.location.origin}/q/{quiz.slug}
            </div>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/q/${quiz.slug}`); setMsg('Copiado!') }}
            style={{ background: 'rgba(37,99,255,0.12)', border: '1px solid rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: '11px', fontWeight: '600', padding: '6px 14px', borderRadius: '7px', cursor: 'pointer' }}
          >
            Copiar
          </button>
        </div>
      )}

      {/* INFO BLOCOS */}
      <div style={{ fontSize: '11px', color: '#4e6a90', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ color: '#60a5fa' }}>⚡</span>
        {blocks.length} blocos gerados pela IA · clique para editar
      </div>

      {/* BLOCOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {blocks.map((block) => {
          const colors = typeColors[block.type] ?? { bg: 'rgba(100,100,100,0.1)', text: '#888', border: 'rgba(100,100,100,0.2)' }
          const isEditing = editando === block.id
          return (
            <div key={block.id} style={{ background: '#0a1120', border: `1px solid ${isEditing ? 'rgba(37,99,255,0.4)' : '#162035'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border 0.2s' }}>
              {/* HEADER */}
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
                <button onClick={e => { e.stopPropagation(); deleteBlock(block.id) }} style={{ background: 'none', border: 'none', color: '#4e6a90', cursor: 'pointer', fontSize: '14px', padding: '4px 8px', borderRadius: '6px' }}>
                  ✕
                </button>
              </div>

              {/* EDITOR */}
              {isEditing && (
                <div style={{ padding: '16px', borderTop: '1px solid #162035', background: 'rgba(0,0,0,0.3)' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>
                      Título <span style={{ color: '#60a5fa', textTransform: 'none', letterSpacing: 0 }}>(*palavra* = azul)</span>
                    </div>
                    <textarea
                      value={block.title}
                      onChange={e => updateBlock(block.id, 'title', e.target.value)}
                      rows={2}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #162035', borderRadius: '8px', color: '#eef2ff', fontSize: '13px', padding: '10px 12px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Subtítulo</div>
                    <textarea
                      value={block.subtitle}
                      onChange={e => updateBlock(block.id, 'subtitle', e.target.value)}
                      rows={2}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #162035', borderRadius: '8px', color: '#eef2ff', fontSize: '13px', padding: '10px 12px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  {block.options && block.options.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Opções (uma por linha)</div>
                      <textarea
                        value={block.options.join('\n')}
                        onChange={e => updateOptions(block.id, e.target.value)}
                        rows={block.options.length + 1}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #162035', borderRadius: '8px', color: '#eef2ff', fontSize: '13px', padding: '10px 12px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}
                  <button
                    onClick={() => { setEditando(null); salvar() }}
                    style={{ background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontSize: '12px', fontWeight: '700', fontFamily: 'Syne, sans-serif', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                  >
                    Salvar bloco
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* FOOTER */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: '#4e6a90', fontSize: '12px', cursor: 'pointer' }}>
          ← Voltar ao dashboard
        </button>
      </div>
    </div>
  )
}