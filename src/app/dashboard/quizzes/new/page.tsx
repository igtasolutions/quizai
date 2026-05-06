'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const blocos = [
  { key: 'perguntas', label: 'Perguntas de dor', desc: 'Diagnóstico emocional' },
  { key: 'matematica', label: 'Matemática da inércia', desc: 'Custo de não agir' },
  { key: 'vsl', label: 'VSL embutida', desc: 'Vídeo dentro do quiz' },
  { key: 'arquetipo', label: 'Resultado / arquétipo', desc: 'Diagnóstico personalizado' },
  { key: 'prova', label: 'Prova social', desc: 'Depoimentos' },
  { key: 'objecao', label: 'Quebra de objeção', desc: 'Antes da oferta' },
  { key: 'lead', label: 'Captura de lead', desc: 'Nome, e-mail, WhatsApp' },
  { key: 'oferta', label: 'Página de oferta', desc: 'Timer + stack de valor' },
]

const inputStyle = { width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #162035', borderRadius: '10px', color: '#eef2ff', fontSize: '13px', padding: '11px 14px', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'DM Sans, sans-serif' }
const labelStyle = { display: 'block' as const, fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '6px' }

export default function NovoQuizPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const [product, setProduct] = useState({
    nome: '', nicho: '', preco: '', promessa: '',
    dores: '', beneficios: '', publico: '', url_referencia: '',
    checkout_url: '', whatsapp: '',
  })

  const [config, setConfig] = useState({
    etapas: 'auto',
    blocos_ativos: ['perguntas', 'matematica', 'arquetipo', 'objecao', 'lead', 'oferta'],
    pixel_id: '',
  })

  const toggleBloco = (key: string) => {
    setConfig(c => ({
      ...c,
      blocos_ativos: c.blocos_ativos.includes(key)
        ? c.blocos_ativos.filter(b => b !== key)
        : [...c.blocos_ativos, key]
    }))
  }

  const gerar = async () => {
    setLoading(true)
    setErro('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, config }),
      })
      const { blocks, error } = await res.json()
      if (error) throw new Error(error)

      const res2 = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
    title: product.nome, product, blocks, config, 
    pixel_id: config.pixel_id || null,
    is_ai_generated: true,
  }),
})
      const { quiz, error: error2 } = await res2.json()
      if (error2) throw new Error(error2)

      router.push(`/dashboard/quizzes/${quiz.id}`)
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao gerar quiz')
      setLoading(false)
    }
  }

  const cardStyle = { background: '#0a1120', border: '1px solid #162035', borderRadius: '14px', padding: '24px', marginBottom: '14px', position: 'relative' as const, overflow: 'hidden' as const }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '680px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Novo Quiz
        </h1>
        <p style={{ fontSize: '13px', color: '#4e6a90', margin: 0 }}>
          Descreva seu produto e a IA monta tudo em 60 segundos
        </p>
      </div>

      {/* STEPS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
        {['Produto', 'Configurar', 'Gerar'].map((s, i) => (
          <div key={s} style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
            background: step === i+1 ? 'linear-gradient(135deg, #2563ff, #1d4ed8)' : step > i+1 ? 'rgba(34,197,94,0.1)' : '#0a1120',
            border: `1px solid ${step === i+1 ? '#2563ff' : step > i+1 ? 'rgba(34,197,94,0.3)' : '#162035'}`,
            color: step === i+1 ? '#fff' : step > i+1 ? '#22c55e' : '#4e6a90',
            boxShadow: step === i+1 ? '0 0 16px rgba(37,99,255,0.3)' : 'none',
          }}>
            <span>{step > i+1 ? '✓' : i+1}</span> {s}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <div style={cardStyle}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(37,99,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}/>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#eef2ff', marginBottom: '18px', fontFamily: 'Syne, sans-serif' }}>Sobre o produto</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Nome do produto</label>
                <input value={product.nome} onChange={e => setProduct(p => ({...p, nome: e.target.value}))} placeholder="Ex: Método Vendas no WhatsApp" style={inputStyle}/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Nicho</label>
                  <input value={product.nicho} onChange={e => setProduct(p => ({...p, nicho: e.target.value}))} placeholder="Ex: Marketing Digital" style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Preço (R$)</label>
                  <input value={product.preco} onChange={e => setProduct(p => ({...p, preco: e.target.value}))} placeholder="Ex: 297" style={inputStyle}/>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Promessa principal</label>
                <textarea value={product.promessa} onChange={e => setProduct(p => ({...p, promessa: e.target.value}))} placeholder="O que seu produto entrega de concreto?" rows={2} style={{...inputStyle, resize: 'none'}}/>
              </div>
              <div>
                <label style={labelStyle}>Dores do público</label>
                <textarea value={product.dores} onChange={e => setProduct(p => ({...p, dores: e.target.value}))} placeholder="Separe por vírgula..." rows={2} style={{...inputStyle, resize: 'none'}}/>
              </div>
              <div>
                <label style={labelStyle}>Benefícios</label>
                <textarea value={product.beneficios} onChange={e => setProduct(p => ({...p, beneficios: e.target.value}))} placeholder="Ex: vendas automáticas, sem aparecer..." rows={2} style={{...inputStyle, resize: 'none'}}/>
              </div>
              <div>
                <label style={labelStyle}>Público-alvo</label>
                <input value={product.publico} onChange={e => setProduct(p => ({...p, publico: e.target.value}))} placeholder="Ex: Afiliados iniciantes" style={inputStyle}/>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#eef2ff', marginBottom: '6px', fontFamily: 'Syne, sans-serif' }}>Referência (opcional)</div>
            <div style={{ fontSize: '12px', color: '#4e6a90', marginBottom: '12px' }}>Cole a URL de um quiz que você admira. A IA usa como base.</div>
            <input value={product.url_referencia} onChange={e => setProduct(p => ({...p, url_referencia: e.target.value}))} placeholder="https://quiz-referencia.com" style={inputStyle}/>
          </div>

          <button onClick={() => setStep(2)} style={{ width: '100%', background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '14px', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 0 24px rgba(37,99,255,0.35)' }}>
            Próximo — Configurar →
          </button>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <div style={cardStyle}>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#eef2ff', marginBottom: '14px', fontFamily: 'Syne, sans-serif' }}>Quantidade de etapas</div>
            <select value={config.etapas} onChange={e => setConfig(c => ({...c, etapas: e.target.value}))} style={{...inputStyle}}>
              <option value="auto">Automático — IA decide o ideal</option>
              <option value="short">Curto — 5 a 8 etapas</option>
              <option value="mid">Médio — 10 a 13 etapas</option>
              <option value="full">Completo — 15 a 21 etapas</option>
            </select>
          </div>

          <div style={cardStyle}>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#eef2ff', marginBottom: '14px', fontFamily: 'Syne, sans-serif' }}>Blocos do quiz</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {blocos.map(b => {
                const ativo = config.blocos_ativos.includes(b.key)
                return (
                  <div key={b.key} onClick={() => toggleBloco(b.key)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', border: `1px solid ${ativo ? 'rgba(37,99,255,0.4)' : '#162035'}`, background: ativo ? 'rgba(37,99,255,0.06)' : 'rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ width: '32px', height: '18px', borderRadius: '9px', background: ativo ? '#2563ff' : '#162035', position: 'relative', flexShrink: 0, transition: 'all 0.2s' }}>
                      <div style={{ position: 'absolute', top: '3px', left: ativo ? '15px' : '3px', width: '12px', height: '12px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }}/>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: ativo ? '#eef2ff' : '#4e6a90' }}>{b.label}</div>
                      <div style={{ fontSize: '10px', color: '#4e6a90' }}>{b.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#eef2ff', marginBottom: '14px', fontFamily: 'Syne, sans-serif' }}>Links e integrações</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Link do checkout</label>
                <input value={product.checkout_url} onChange={e => setProduct(p => ({...p, checkout_url: e.target.value}))} placeholder="Hotmart, Kiwify, Greenn..." style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>WhatsApp (com DDD)</label>
                <input value={product.whatsapp} onChange={e => setProduct(p => ({...p, whatsapp: e.target.value}))} placeholder="(11) 99999-9999" style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Pixel do Facebook (ID)</label>
                <input value={config.pixel_id} onChange={e => setConfig(c => ({...c, pixel_id: e.target.value}))} placeholder="Ex: 1234567890123456" style={{...inputStyle, fontFamily: 'monospace'}}/>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, background: '#0a1120', border: '1px solid #162035', color: '#4e6a90', fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '13px', padding: '13px', borderRadius: '12px', cursor: 'pointer' }}>
              ← Voltar
            </button>
            <button onClick={() => { setStep(3); gerar() }} style={{ flex: 2, background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '13px', padding: '13px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(37,99,255,0.3)' }}>
              ⚡ Gerar quiz com IA →
            </button>
          </div>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(37,99,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }}/>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
          <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '8px' }}>
            Gerando seu quiz...
          </div>
          <div style={{ fontSize: '13px', color: '#4e6a90', marginBottom: '28px' }}>
            A IA está montando todos os blocos com copy de alta conversão
          </div>
          <div style={{ width: '100%', height: '3px', background: '#162035', borderRadius: '2px', overflow: 'hidden', maxWidth: '300px', margin: '0 auto' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #2563ff, #60a5fa)', borderRadius: '2px', width: '70%', animation: 'pulse 1.5s infinite' }}/>
          </div>
          {erro && (
            <div style={{ marginTop: '20px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#f87171', maxWidth: '400px', margin: '20px auto 0' }}>
              {erro}
            </div>
          )}
        </div>
      )}
    </div>
  )
}