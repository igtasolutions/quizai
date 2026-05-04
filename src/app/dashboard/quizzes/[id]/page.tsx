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

export default function EditarQuizPage() {
  const { id } = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<any>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [editando, setEditando] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [publicando, setPublicando] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/quiz')
      .then(r => r.json())
      .then(({ quizzes }) => {
        const q = quizzes?.find((x: any) => x.id === id)
        if (q) { setQuiz(q); setBlocks(q.blocks ?? []) }
      })
  }, [id])

  const salvar = async () => {
    setSalvando(true)
    await fetch(`/api/quiz/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    })
    setSalvando(false)
    setMsg('Salvo!')
    setTimeout(() => setMsg(''), 2000)
  }

  const publicar = async () => {
    setPublicando(true)
    await fetch(`/api/quiz/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks, status: 'active' }),
    })
    setPublicando(false)
    setMsg('Quiz publicado! ✅')
    setQuiz((q: any) => ({ ...q, status: 'active' }))
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
      i % 2 === 1
        ? <span key={i} className="text-blue-400">{part}</span>
        : <span key={i}>{part}</span>
    )
  }

  const typeColors: Record<string, string> = {
    headline: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    question: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    insight: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    capture: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    offer: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    bridge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    social_proof: 'bg-green-500/10 text-green-400 border-green-500/20',
  }

  if (!quiz) return (
    <div className="p-6 text-center text-[#4e6a90]">Carregando...</div>
  )

  const slug = quiz.slug
  const isActive = quiz.status === 'active'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">{quiz.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-[#4e6a90]'}`}/>
            <span className="text-xs text-[#4e6a90]">{isActive ? 'Ativo' : 'Rascunho'}</span>
            {isActive && (
              <span className="text-xs text-blue-400 font-mono">quizai.app/q/{slug}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {msg && <span className="text-xs text-green-400 flex items-center">{msg}</span>}
          <button onClick={salvar} disabled={salvando} className="bg-[#0a1120] border border-[#162035] text-[#4e6a90] text-xs font-bold px-4 py-2 rounded-lg hover:text-white transition-colors">
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button onClick={publicar} disabled={publicando} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-[0_0_14px_rgba(37,99,255,0.3)]">
            {publicando ? 'Publicando...' : isActive ? '✓ Publicado' : '⚡ Publicar'}
          </button>
        </div>
      </div>

      {/* LINK DO QUIZ */}
      {isActive && (
        <div className="bg-[#0a1120] border border-blue-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4e6a90] mb-1">Link do seu quiz</div>
            <div className="text-sm text-blue-400 font-mono">http://localhost:3000/q/{slug}</div>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(`http://localhost:3000/q/${slug}`); setMsg('Link copiado!') }}
            className="bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-lg"
          >
            Copiar
          </button>
        </div>
      )}

      {/* BLOCOS */}
      <div className="text-xs text-[#4e6a90] mb-3 flex items-center gap-2">
        ⚡ {blocks.length} blocos gerados pela IA · clique para editar
      </div>

      <div className="flex flex-col gap-3">
        {blocks.map((block, idx) => (
          <div key={block.id} className={`bg-[#0a1120] border rounded-xl overflow-hidden transition-all ${editando === block.id ? 'border-blue-500/50' : 'border-[#162035] hover:border-[#1e3050]'}`}>
            {/* HEADER DO BLOCO */}
            <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setEditando(editando === block.id ? null : block.id)}>
              <span className="text-[#4e6a90] text-sm">⠿</span>
              <span className={`text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${typeColors[block.type] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                {block.type}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#4e6a90]">{block.label}</div>
                <div className="text-sm truncate">{renderTitle(block.title)}</div>
              </div>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <button onClick={() => deleteBlock(block.id)} className="text-[#4e6a90] hover:text-red-400 text-xs transition-colors">✕</button>
              </div>
            </div>

            {/* EDITOR DO BLOCO */}
            {editando === block.id && (
              <div className="px-4 pb-4 border-t border-[#162035] pt-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1">
                      Título <span className="text-blue-400 normal-case tracking-normal">(*palavra* = azul)</span>
                    </label>
                    <textarea
                      value={block.title}
                      onChange={e => updateBlock(block.id, 'title', e.target.value)}
                      rows={2}
                      className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-2 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1">Subtítulo</label>
                    <textarea
                      value={block.subtitle}
                      onChange={e => updateBlock(block.id, 'subtitle', e.target.value)}
                      rows={2}
                      className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-2 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff] resize-none"
                    />
                  </div>
                  {block.options && block.options.length > 0 && (
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1">Opções (uma por linha)</label>
                      <textarea
                        value={block.options.join('\n')}
                        onChange={e => updateOptions(block.id, e.target.value)}
                        rows={block.options.length + 1}
                        className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-2 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff] resize-none"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => { updateBlock(block.id, 'title', block.title); setEditando(null); salvar() }}
                    className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg w-fit"
                  >
                    Salvar bloco
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* PREVIEW */}
      <div className="mt-6 bg-[#0a1120] border border-[#162035] rounded-xl p-4">
        <div className="text-xs text-[#4e6a90] mb-3">👁 Preview do primeiro bloco</div>
        {blocks[0] && (
          <div className="bg-[#05090f] rounded-lg p-4 max-w-xs mx-auto">
            <div className="text-[9px] uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-blue-400"/>
              {blocks[0].label}
            </div>
            <div className="font-bold text-sm leading-snug mb-2">{renderTitle(blocks[0].title)}</div>
            <div className="text-xs text-[#4e6a90] leading-relaxed">{blocks[0].subtitle}</div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <button onClick={() => router.push('/dashboard')} className="text-xs text-[#4e6a90] hover:text-white transition-colors">
          ← Voltar ao dashboard
        </button>
      </div>
    </div>
  )
}