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
          title: product.nome,
          product,
          blocks,
          config,
          pixel_id: config.pixel_id || null,
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

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Novo Quiz</h1>
        <p className="text-sm text-[#4e6a90]">Descreva seu produto e a IA monta tudo em 60 segundos</p>
      </div>

      {/* STEPS */}
      <div className="flex gap-2 mb-8">
        {['Produto', 'Configurar', 'Gerar'].map((s, i) => (
          <div key={s} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${step === i+1 ? 'bg-blue-600 border-blue-600 text-white' : step > i+1 ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-[#0a1120] border-[#162035] text-[#4e6a90]'}`}>
            <span>{step > i+1 ? '✓' : i+1}</span> {s}
          </div>
        ))}
      </div>

      {/* STEP 1: PRODUTO */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="bg-[#0a1120] border border-[#162035] rounded-xl p-5">
            <div className="font-bold mb-4">Sobre o produto</div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1">Nome do produto</label>
                <input value={product.nome} onChange={e => setProduct(p => ({...p, nome: e.target.value}))} placeholder="Ex: Método Vendas no WhatsApp" className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-2.5 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff]"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1">Nicho</label>
                  <input value={product.nicho} onChange={e => setProduct(p => ({...p, nicho: e.target.value}))} placeholder="Ex: Marketing Digital" className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-2.5 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff]"/>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1">Preço (R$)</label>
                  <input value={product.preco} onChange={e => setProduct(p => ({...p, preco: e.target.value}))} placeholder="Ex: 297" className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-2.5 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff]"/>
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1">Promessa principal</label>
                <textarea value={product.promessa} onChange={e => setProduct(p => ({...p, promessa: e.target.value}))} placeholder="O que seu produto entrega de concreto?" rows={2} className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-2.5 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff] resize-none"/>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1">Dores do público</label>
                <textarea value={product.dores} onChange={e => setProduct(p => ({...p, dores: e.target.value}))} placeholder="Separe por vírgula..." rows={2} className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-2.5 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff] resize-none"/>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1">Benefícios</label>
                <textarea value={product.beneficios} onChange={e => setProduct(p => ({...p, beneficios: e.target.value}))} placeholder="Ex: vendas automáticas, sem aparecer..." rows={2} className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-2.5 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff] resize-none"/>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1">Público-alvo</label>
                <input value={product.publico} onChange={e => setProduct(p => ({...p, publico: e.target.value}))} placeholder="Ex: Afiliados iniciantes" className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-2.5 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff]"/>
              </div>
            </div>
          </div>

          <div className="bg-[#0a1120] border border-[#162035] rounded-xl p-5">
            <div className="font-bold mb-1">Referência (opcional)</div>
            <div className="text-xs text-[#4e6a90] mb-3">Cole a URL de um quiz que você admira. A IA usa como base.</div>
            <input value={product.url_referencia} onChange={e => setProduct(p => ({...p, url_referencia: e.target.value}))} placeholder="https://quiz-referencia.com" className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-2.5 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff]"/>
          </div>

          <button onClick={() => setStep(2)} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-[0_0_20px_rgba(37,99,255,0.3)]">
            Próximo — Configurar →
          </button>
        </div>
      )}

      {/* STEP 2: CONFIGURAR */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="bg-[#0a1120] border border-[#162035] rounded-xl p-5">
            <div className="font-bold mb-3">Quantidade de etapas</div>
            <select value={config.etapas} onChange={e => setConfig(c => ({...c, etapas: e.target.value}))} className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-2.5 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff]">
              <option value="auto">Automático — IA decide o ideal</option>
              <option value="short">Curto — 5 a 8 etapas</option>
              <option value="mid">Médio — 10 a 13 etapas</option>
              <option value="full">Completo — 15 a 21 etapas</option>
            </select>
          </div>

          <div className="bg-[#0a1120] border border-[#162035] rounded-xl p-5">
            <div className="font-bold mb-3">Blocos do quiz</div>
            <div className="grid grid-cols-2 gap-2">
              {blocos.map(b => (
                <div key={b.key} onClick={() => toggleBloco(b.key)} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${config.blocos_ativos.includes(b.key) ? 'border-blue-500 bg-blue-500/08' : 'border-[#162035] bg-black/20 hover:border-blue-500/40'}`}>
                  <div className={`w-8 h-4 rounded-full flex-shrink-0 relative transition-all ${config.blocos_ativos.includes(b.key) ? 'bg-blue-500' : 'bg-[#162035]'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${config.blocos_ativos.includes(b.key) ? 'left-4' : 'left-0.5'}`}/>
                  </div>
                  <div>
                    <div className="text-xs font-medium">{b.label}</div>
                    <div className="text-[10px] text-[#4e6a90]">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0a1120] border border-[#162035] rounded-xl p-5">
            <div className="font-bold mb-3">Links</div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1">Link do checkout</label>
                <input value={product.checkout_url} onChange={e => setProduct(p => ({...p, checkout_url: e.target.value}))} placeholder="Hotmart, Kiwify, Greenn..." className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-2.5 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff]"/>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1">WhatsApp</label>
                <input value={product.whatsapp} onChange={e => setProduct(p => ({...p, whatsapp: e.target.value}))} placeholder="(11) 99999-9999" className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-2.5 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff]"/>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#4e6a90] mb-1">Pixel do Facebook (ID)</label>
                <input value={config.pixel_id} onChange={e => setConfig(c => ({...c, pixel_id: e.target.value}))} placeholder="Ex: 1234567890123456" className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-2.5 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff]"/>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 bg-[#0a1120] border border-[#162035] text-[#4e6a90] font-bold py-3 rounded-xl text-sm hover:text-white transition-colors">
              ← Voltar
            </button>
            <button onClick={() => { setStep(3); gerar() }} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-[0_0_20px_rgba(37,99,255,0.3)]">
              ⚡ Gerar quiz com IA →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: GERANDO */}
      {step === 3 && (
        <div className="bg-[#0a1120] border border-[#162035] rounded-xl p-12 text-center">
          <div className="text-5xl mb-4" style={{animation: 'pulse 1.5s infinite'}}>⚡</div>
          <div className="font-bold text-xl mb-2">Gerando seu quiz...</div>
          <div className="text-sm text-[#4e6a90] mb-6">A IA está montando todos os blocos com copy de alta conversão</div>
          <div className="w-full h-1 bg-[#162035] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-pulse" style={{width:'70%'}}/>
          </div>
          {erro && (
            <div className="mt-4 text-red-400 text-sm">{erro}</div>
          )}
        </div>
      )}
    </div>
  )
}