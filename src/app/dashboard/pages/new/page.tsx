'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const inp: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #162035',
  borderRadius: '10px', color: '#eef2ff', fontSize: '13px', padding: '11px 14px',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '10px', color: '#4e6a90',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
}

const PAGE_SECTIONS = [
  { key: 'hero', label: 'Hero / Headline', desc: 'Primeira dobra que prende a atenção' },
  { key: 'dor', label: 'Agitação de dor', desc: 'Aprofunda o problema do público' },
  { key: 'solucao', label: 'Apresentação da solução', desc: 'Apresenta o produto como saída' },
  { key: 'beneficios', label: 'Benefícios', desc: 'Lista os principais resultados' },
  { key: 'prova', label: 'Prova social', desc: 'Depoimentos e resultados reais' },
  { key: 'oferta', label: 'Oferta e preço', desc: 'Stack de valor + CTA principal' },
  { key: 'objecao', label: 'Quebra de objeção', desc: 'FAQ e garantia' },
  { key: 'urgencia', label: 'Urgência / Escassez', desc: 'Timer e vagas limitadas' },
]

export default function NovaPaginaPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'choose' | 'ai' | 'manual'>('choose')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [manualTitle, setManualTitle] = useState('')
  const [creatingManual, setCreatingManual] = useState(false)

  const [product, setProduct] = useState({
    nome: '', nicho: '', preco: '', promessa: '',
    dores: '', beneficios: '', publico: '', checkout_url: '',
  })

  const [selectedSections, setSelectedSections] = useState(
    ['hero', 'dor', 'solucao', 'beneficios', 'prova', 'oferta', 'objecao']
  )

  const toggleSection = (key: string) => {
    setSelectedSections(s => s.includes(key) ? s.filter(x => x !== key) : [...s, key])
  }

  const set = (k: string, v: string) => setProduct(p => ({ ...p, [k]: v }))

  const criarManual = async () => {
    if (!manualTitle.trim()) return
    setCreatingManual(true)
    const res = await fetch('/api/page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: manualTitle,
        blocks: [],
        is_ai_generated: false,
      }),
    })
    const { page, error } = await res.json()
    if (error) { setErro(error); setCreatingManual(false); return }
    router.push(`/dashboard/pages/${page.id}`)
  }

  const gerarComIA = async () => {
    if (!product.nome || !product.promessa) { setErro('Preencha pelo menos o nome do produto e a promessa principal.'); return }
    setLoading(true)
    setErro('')

    try {
      // 1. Gera blocos com IA
      const res = await fetch('/api/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, sections: selectedSections }),
      })
      const { blocks, error } = await res.json()
      if (error) throw new Error(error)

      // 2. Salva a página
      const res2 = await fetch('/api/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Landing Page — ${product.nome}`,
          blocks,
          is_ai_generated: true,
          product,
        }),
      })
      const { page, error: e2 } = await res2.json()
      if (e2) throw new Error(e2)

      router.push(`/dashboard/pages/${page.id}`)
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao gerar página')
      setLoading(false)
    }
  }

  // ── TELA INICIAL ────────────────────────────────────────────────────────
  if (mode === 'choose') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05090f', fontFamily: 'DM Sans, sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: '560px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🗂️</div>
          <h1 style={{ fontSize: '28px', fontWeight: '300', fontFamily: 'Syne, sans-serif', color: '#e8eeff', letterSpacing: '-1px', margin: '0 0 8px' }}>Nova landing page</h1>
          <p style={{ fontSize: '14px', color: '#4e6a90', margin: 0 }}>Como você quer criar?</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <button onClick={() => setMode('ai')} style={{ background: '#0a1120', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '16px', padding: '28px 20px', textAlign: 'left', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'all 0.2s' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)' }}/>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>⚡</div>
            <div style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '6px', letterSpacing: '-0.3px' }}>Gerar com IA</div>
            <div style={{ fontSize: '12px', color: '#4e6a90', lineHeight: '1.6' }}>Descreva seu produto e a IA cria a landing page completa em segundos</div>
            <div style={{ marginTop: '16px', fontSize: '11px', color: '#a78bfa', fontWeight: '600' }}>Recomendado →</div>
          </button>
          <button onClick={() => setMode('manual')} style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '16px', padding: '28px 20px', textAlign: 'left', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'all 0.2s' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.4), transparent)' }}/>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>✏️</div>
            <div style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '6px', letterSpacing: '-0.3px' }}>Criar manual</div>
            <div style={{ fontSize: '12px', color: '#4e6a90', lineHeight: '1.6' }}>Canvas em branco. Adicione componentes do jeito que quiser</div>
            <div style={{ marginTop: '16px', fontSize: '11px', color: '#60a5fa', fontWeight: '600' }}>Controle total →</div>
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button onClick={() => router.push('/dashboard/pages')} style={{ background: 'none', border: 'none', color: '#4e6a90', fontSize: '12px', cursor: 'pointer' }}>← Voltar</button>
        </div>
      </div>
    </div>
  )

  // ── MANUAL ──────────────────────────────────────────────────────────────
  if (mode === 'manual') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05090f', fontFamily: 'DM Sans, sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: '420px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>✏️</div>
          <h2 style={{ fontSize: '22px', fontWeight: '300', fontFamily: 'Syne, sans-serif', color: '#e8eeff', letterSpacing: '-0.8px', margin: '0 0 6px' }}>Página manual</h2>
          <p style={{ fontSize: '13px', color: '#4e6a90', margin: 0 }}>Dê um nome para começar</p>
        </div>
        <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '16px', padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Nome da página</label>
            <input value={manualTitle} onChange={e => setManualTitle(e.target.value)} placeholder="Ex: Landing Page Curso de Marketing" style={inp} onKeyDown={e => e.key === 'Enter' && criarManual()}/>
          </div>
          {erro && <div style={{ fontSize: '12px', color: '#f87171', marginBottom: '12px' }}>{erro}</div>}
          <button onClick={criarManual} disabled={creatingManual || !manualTitle.trim()} style={{ width: '100%', background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '14px', padding: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer', opacity: !manualTitle.trim() ? 0.5 : 1 }}>
            {creatingManual ? 'Criando...' : 'Abrir editor →'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button onClick={() => setMode('choose')} style={{ background: 'none', border: 'none', color: '#4e6a90', fontSize: '12px', cursor: 'pointer' }}>← Voltar</button>
        </div>
      </div>
    </div>
  )

  // ── IA ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#05090f', fontFamily: 'DM Sans, sans-serif', padding: '32px 24px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <button onClick={() => setMode('choose')} style={{ background: 'none', border: 'none', color: '#4e6a90', fontSize: '12px', cursor: 'pointer', marginBottom: '16px', padding: 0 }}>← Voltar</button>
          <h2 style={{ fontSize: '24px', fontWeight: '300', fontFamily: 'Syne, sans-serif', color: '#e8eeff', letterSpacing: '-1px', margin: '0 0 6px' }}>Gerar landing page com IA</h2>
          <p style={{ fontSize: '13px', color: '#4e6a90', margin: 0 }}>Preencha os dados do produto e a IA monta tudo</p>
        </div>

        <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#60a5fa', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📦 Produto</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={lbl}>Nome do produto *</label>
              <input value={product.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Método Financeiro 30 Dias" style={inp}/>
            </div>
            <div>
              <label style={lbl}>Nicho</label>
              <input value={product.nicho} onChange={e => set('nicho', e.target.value)} placeholder="Ex: Educação financeira" style={inp}/>
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={lbl}>Promessa principal *</label>
            <input value={product.promessa} onChange={e => set('promessa', e.target.value)} placeholder="Ex: Sair das dívidas e guardar dinheiro em 30 dias" style={inp}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={lbl}>Público-alvo</label>
              <input value={product.publico} onChange={e => set('publico', e.target.value)} placeholder="Ex: Mulheres 25-45 endividadas" style={inp}/>
            </div>
            <div>
              <label style={lbl}>Preço</label>
              <input value={product.preco} onChange={e => set('preco', e.target.value)} placeholder="Ex: R$997" style={inp}/>
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={lbl}>Dores do público</label>
            <textarea value={product.dores} onChange={e => set('dores', e.target.value)} placeholder="Ex: Não consegue guardar dinheiro, sempre no vermelho, sem perspectiva..." rows={3} style={{ ...inp, resize: 'none' }}/>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={lbl}>Benefícios / Resultados</label>
            <textarea value={product.beneficios} onChange={e => set('beneficios', e.target.value)} placeholder="Ex: Controle financeiro total, sair das dívidas, criar reserva de emergência..." rows={3} style={{ ...inp, resize: 'none' }}/>
          </div>
          <div>
            <label style={lbl}>URL do checkout</label>
            <input value={product.checkout_url} onChange={e => set('checkout_url', e.target.value)} placeholder="https://pay.kiwify.com.br/..." style={inp}/>
          </div>
        </div>

        <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#a78bfa', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🧩 Seções da página</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {PAGE_SECTIONS.map(s => (
              <div key={s.key} onClick={() => toggleSection(s.key)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${selectedSections.includes(s.key) ? 'rgba(167,139,250,0.4)' : '#162035'}`, background: selectedSections.includes(s.key) ? 'rgba(167,139,250,0.08)' : 'rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `1.5px solid ${selectedSections.includes(s.key) ? '#a78bfa' : '#4e6a90'}`, background: selectedSections.includes(s.key) ? '#a78bfa' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#fff', flexShrink: 0 }}>
                  {selectedSections.includes(s.key) ? '✓' : ''}
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#eef2ff' }}>{s.label}</div>
                  <div style={{ fontSize: '10px', color: '#4e6a90' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {erro && (
          <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#f87171' }}>
            {erro}
          </div>
        )}

        <button onClick={gerarComIA} disabled={loading} style={{ width: '100%', background: loading ? '#162035' : 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: loading ? '#4e6a90' : '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '15px', padding: '16px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 0 32px rgba(37,99,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}>
          {loading ? (
            <>
              <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #4e6a90', borderTopColor: '#60a5fa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
              Gerando sua landing page com IA...
            </>
          ) : '⚡ Gerar landing page agora'}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}