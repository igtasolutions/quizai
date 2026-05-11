'use client'
import { useState } from 'react'

// ── Tipos ──────────────────────────────────────────────────────────────────
export interface Block {
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
  sections?: any[]
  meterLabel?: string
  meterMax?: number
  calculatorLabel?: string
  calculatorUnit?: string
  calculatorMultiplier?: number
  scoreWeight?: number
  // novos campos
  fieldType?: string        // campo de formulário: text | email | phone | number | select | textarea
  fieldLabel?: string
  fieldPlaceholder?: string
  fieldRequired?: boolean
  buttonText?: string
  buttonUrl?: string
  buttonStyle?: string      // primary | secondary | outline
  timerSeconds?: number
  timerLabel?: string
  timerAction?: string      // hide | redirect | show_message
  alertType?: string        // info | warning | success | error
  alertTitle?: string
  alertText?: string
  beforeText?: string
  afterText?: string
  beforeImage?: string
  afterImage?: string
  htmlCode?: string
  spacerHeight?: number
  audioUrl?: string
  faqItems?: { q: string; a: string }[]
  carouselItems?: { image?: string; title?: string; text?: string }[]
  priceValue?: string
  pricePeriod?: string
  priceFeatures?: string[]
  priceButtonText?: string
  priceButtonUrl?: string
  chartLabels?: string[]
  chartValues?: number[]
  chartType?: string        // bar | line | donut
  notificationText?: string
  notificationIcon?: string
  loadingText?: string
  argumentTitle?: string
  argumentText?: string
  argumentIcon?: string
  multipleChoice?: boolean  // multiple choice vs single
  yesLabel?: string
  noLabel?: string
  weightLabel?: string
  heightLabel?: string
}

// ── Catálogo de componentes ────────────────────────────────────────────────
interface ComponentDef {
  type: string
  label: string
  icon: string
  description: string
  color: string
  factory: () => Partial<Block>
}

const COMPONENT_CATALOG: { category: string; icon: string; color: string; items: ComponentDef[] }[] = [
  {
    category: 'Formulário',
    icon: '📋',
    color: '#60a5fa',
    items: [
      {
        type: 'field',
        label: 'Campo de texto',
        icon: '✏️',
        description: 'Nome, email, telefone ou texto livre',
        color: '#60a5fa',
        factory: () => ({
          type: 'field', label: 'CAMPO', title: 'Qual é o seu nome?', subtitle: 'Precisamos saber como te chamar', options: [],
          fieldType: 'text', fieldLabel: 'Nome completo', fieldPlaceholder: 'Digite seu nome...', fieldRequired: true,
        }),
      },
      {
        type: 'field_email',
        label: 'Campo de e-mail',
        icon: '📧',
        description: 'Captura de e-mail com validação',
        color: '#60a5fa',
        factory: () => ({
          type: 'field', label: 'E-MAIL', title: 'Qual é o seu melhor e-mail?', subtitle: '', options: [],
          fieldType: 'email', fieldLabel: 'E-mail', fieldPlaceholder: 'seu@email.com', fieldRequired: true,
        }),
      },
      {
        type: 'field_phone',
        label: 'Campo de WhatsApp',
        icon: '📱',
        description: 'Número de telefone / WhatsApp',
        color: '#60a5fa',
        factory: () => ({
          type: 'field', label: 'WHATSAPP', title: 'Qual é o seu WhatsApp?', subtitle: 'Enviaremos seu resultado por lá', options: [],
          fieldType: 'phone', fieldLabel: 'WhatsApp', fieldPlaceholder: '(11) 99999-9999', fieldRequired: true,
        }),
      },
      {
        type: 'cta_button',
        label: 'Botão CTA',
        icon: '🔘',
        description: 'Botão de ação com link ou próxima etapa',
        color: '#60a5fa',
        factory: () => ({
          type: 'offer', label: 'BOTÃO', title: 'Pronto para dar o próximo passo?', subtitle: 'Clique abaixo e garanta sua vaga agora', options: [],
          buttonText: 'Quero começar agora →', buttonUrl: '', buttonStyle: 'primary',
        }),
      },
      {
        type: 'height_weight',
        label: 'Altura / Peso',
        icon: '📏',
        description: 'Campos numéricos para altura e peso',
        color: '#60a5fa',
        factory: () => ({
          type: 'field', label: 'MEDIDAS', title: 'Qual é a sua altura e peso?', subtitle: 'Usaremos para calcular seu plano ideal', options: [],
          fieldType: 'height_weight', weightLabel: 'Peso (kg)', heightLabel: 'Altura (cm)', fieldRequired: true,
        }),
      },
    ],
  },
  {
    category: 'Quiz',
    icon: '🧩',
    color: '#a78bfa',
    items: [
      {
        type: 'question',
        label: 'Escolha única',
        icon: '⚪',
        description: 'O lead escolhe uma resposta',
        color: '#a78bfa',
        factory: () => ({
          type: 'question', label: 'PERGUNTA', title: 'Como você descreveria sua situação atual?', subtitle: '', options: ['Estou começando agora', 'Já tenho experiência', 'Quero escalar os resultados'],
        }),
      },
      {
        type: 'multiple_choice',
        label: 'Múltipla escolha',
        icon: '☑️',
        description: 'O lead escolhe mais de uma opção',
        color: '#a78bfa',
        factory: () => ({
          type: 'question', label: 'MÚLTIPLA ESCOLHA', title: 'Quais são seus maiores desafios?', subtitle: 'Pode escolher mais de uma opção', options: ['Falta de tempo', 'Falta de capital', 'Não sei por onde começar', 'Concorrência alta'],
          multipleChoice: true,
        }),
      },
      {
        type: 'yes_no',
        label: 'Sim / Não',
        icon: '✅',
        description: 'Pergunta binária sim ou não',
        color: '#a78bfa',
        factory: () => ({
          type: 'question', label: 'SIM / NÃO', title: 'Você já tentou resolver isso antes?', subtitle: '', options: ['Sim', 'Não'],
          yesLabel: 'Sim, já tentei', noLabel: 'Não, é minha primeira vez',
        }),
      },
      {
        type: 'video_response',
        label: 'Vídeo resposta',
        icon: '🎬',
        description: 'Vídeo + opções de resposta abaixo',
        color: '#a78bfa',
        factory: () => ({
          type: 'video', label: 'VÍDEO RESPOSTA', title: 'Assista e escolha sua resposta', subtitle: '', options: ['Isso faz sentido para mim', 'Preciso de mais informações'],
          videoProvider: 'youtube', videoUrl: '', videoLockSeconds: 0,
        }),
      },
    ],
  },
  {
    category: 'Mídia',
    icon: '🖼️',
    color: '#34d399',
    items: [
      {
        type: 'text_block',
        label: 'Bloco de texto',
        icon: '📝',
        description: 'Texto rico com formatação completa',
        color: '#34d399',
        factory: () => ({
          type: 'rich', label: 'TEXTO', title: 'Isso muda tudo', subtitle: 'Adicione seu texto aqui. Use *palavras* para destacar em azul.', options: [], sections: [],
        }),
      },
      {
        type: 'image_block',
        label: 'Imagem',
        icon: '🖼️',
        description: 'Imagem com legenda opcional',
        color: '#34d399',
        factory: () => ({
          type: 'rich', label: 'IMAGEM', title: '', subtitle: '', options: [], imageUrl: '', imageAlt: 'Imagem', sections: [],
        }),
      },
      {
        type: 'video',
        label: 'Vídeo (VSL)',
        icon: '🎥',
        description: 'YouTube, Vimeo ou Vturb com bloqueio de botão',
        color: '#34d399',
        factory: () => ({
          type: 'video', label: 'VÍDEO', title: 'Assista esse vídeo até o final', subtitle: 'Temos algo especial para você', options: [],
          videoProvider: 'youtube', videoUrl: '', videoLockSeconds: 30, videoLockAction: 'button',
        }),
      },
      {
        type: 'audio',
        label: 'Áudio',
        icon: '🔊',
        description: 'Player de áudio embutido',
        color: '#34d399',
        factory: () => ({
          type: 'rich', label: 'ÁUDIO', title: 'Ouça a mensagem importante', subtitle: '', options: [], audioUrl: '', sections: [],
        }),
      },
    ],
  },
  {
    category: 'Atenção',
    icon: '⚠️',
    color: '#fbbf24',
    items: [
      {
        type: 'alert',
        label: 'Alerta / Aviso',
        icon: '🚨',
        description: 'Caixa de destaque info, aviso ou erro',
        color: '#fbbf24',
        factory: () => ({
          type: 'insight', label: 'ALERTA', title: 'Atenção! Isso é importante', subtitle: 'Leia com atenção antes de continuar.', options: [],
          alertType: 'warning', alertTitle: 'Importante', alertText: 'Você está a um passo de transformar seus resultados.',
        }),
      },
      {
        type: 'notification',
        label: 'Notificação',
        icon: '🔔',
        description: 'Notificação social em tempo real',
        color: '#fbbf24',
        factory: () => ({
          type: 'insight', label: 'NOTIFICAÇÃO', title: '', subtitle: '', options: [],
          notificationText: 'João de São Paulo acabou de se inscrever!', notificationIcon: '🔔',
        }),
      },
      {
        type: 'timer',
        label: 'Timer / Contador',
        icon: '⏱️',
        description: 'Contagem regressiva com ação ao zerar',
        color: '#fbbf24',
        factory: () => ({
          type: 'insight', label: 'TIMER', title: 'Oferta por tempo limitado', subtitle: 'Esta oferta expira em:', options: [],
          timerSeconds: 600, timerLabel: 'Tempo restante', timerAction: 'hide',
        }),
      },
      {
        type: 'loading',
        label: 'Loading / Processando',
        icon: '⏳',
        description: 'Tela de carregamento para criar suspense',
        color: '#fbbf24',
        factory: () => ({
          type: 'bridge', label: 'LOADING', title: 'Analisando suas respostas...', subtitle: 'Aguarde, estamos preparando seu diagnóstico personalizado', options: [],
          loadingText: 'Calculando seu perfil...',
        }),
      },
      {
        type: 'meter',
        label: 'Nível / Medidor',
        icon: '📊',
        description: 'Barra de progresso com score calculado',
        color: '#fbbf24',
        factory: () => ({
          type: 'meter', label: 'MEDIDOR', title: 'Seu nível de urgência', subtitle: 'Baseado nas suas respostas, calculamos seu diagnóstico', options: [],
          meterLabel: 'Nível de urgência', meterMax: 10,
        }),
      },
    ],
  },
  {
    category: 'Argumentação',
    icon: '💡',
    color: '#f87171',
    items: [
      {
        type: 'argument',
        label: 'Argumento',
        icon: '💬',
        description: 'Ponto de argumentação com ícone e texto',
        color: '#f87171',
        factory: () => ({
          type: 'insight', label: 'ARGUMENTO', title: 'Por que isso é urgente para você?', subtitle: 'Cada dia sem agir é dinheiro deixado na mesa. Não espere o momento perfeito — ele nunca vem.', options: [],
          argumentIcon: '💡', argumentTitle: 'A verdade que ninguém te conta',
        }),
      },
      {
        type: 'social_proof',
        label: 'Depoimento',
        icon: '⭐',
        description: 'Foto, nome, cargo e texto de depoimento',
        color: '#f87171',
        factory: () => ({
          type: 'social_proof', label: 'DEPOIMENTO', title: 'O que nossos alunos dizem', subtitle: '', options: [],
          testimonialName: 'Maria Silva', testimonialRole: 'Aluna desde 2024', testimonialText: 'Mudou completamente minha vida. Em 3 meses já recuperei o investimento.', testimonialStars: 5,
        }),
      },
      {
        type: 'faq',
        label: 'FAQ',
        icon: '❓',
        description: 'Perguntas e respostas em acordeão',
        color: '#f87171',
        factory: () => ({
          type: 'rich', label: 'FAQ', title: 'Perguntas frequentes', subtitle: '', options: [],
          sections: [],
          faqItems: [
            { q: 'Isso funciona para mim?', a: 'Sim! O método foi desenvolvido para funcionar independentemente do seu nível atual.' },
            { q: 'Quanto tempo leva para ver resultados?', a: 'A maioria dos nossos alunos vê os primeiros resultados em 30 dias.' },
          ],
        }),
      },
      {
        type: 'price',
        label: 'Preço',
        icon: '💰',
        description: 'Card de preço com features e CTA',
        color: '#f87171',
        factory: () => ({
          type: 'offer', label: 'PREÇO', title: 'Invista no seu futuro hoje', subtitle: 'Acesso completo + bônus exclusivos', options: [],
          priceValue: 'R$997', pricePeriod: 'acesso vitalício',
          priceFeatures: ['Acesso completo ao programa', 'Suporte por 12 meses', 'Comunidade exclusiva', 'Certificado de conclusão'],
          priceButtonText: 'Quero garantir minha vaga →', priceButtonUrl: '',
        }),
      },
      {
        type: 'before_after',
        label: 'Antes / Depois',
        icon: '🔄',
        description: 'Comparação visual antes e depois',
        color: '#f87171',
        factory: () => ({
          type: 'rich', label: 'ANTES / DEPOIS', title: 'A transformação real', subtitle: '', options: [],
          beforeText: 'Antes: sem método, sem resultado', afterText: 'Depois: clareza, sistema e crescimento',
          beforeImage: '', afterImage: '',
          sections: [],
        }),
      },
      {
        type: 'carousel',
        label: 'Carrossel',
        icon: '🎠',
        description: 'Slides de imagens ou cards deslizáveis',
        color: '#f87171',
        factory: () => ({
          type: 'rich', label: 'CARROSSEL', title: 'Resultados dos nossos alunos', subtitle: '', options: [],
          carouselItems: [
            { title: 'Resultado 1', text: 'Em 30 dias, dobrei minhas vendas' },
            { title: 'Resultado 2', text: 'Saí do zero para R$10k no primeiro mês' },
            { title: 'Resultado 3', text: 'Conquistei minha independência financeira' },
          ],
          sections: [],
        }),
      },
    ],
  },
  {
    category: 'Gráficos',
    icon: '📈',
    color: '#38bdf8',
    items: [
      {
        type: 'metrics',
        label: 'Métricas',
        icon: '📊',
        description: 'Números de destaque em grid',
        color: '#38bdf8',
        factory: () => ({
          type: 'rich', label: 'MÉTRICAS', title: 'Nossos números falam por si', subtitle: '', options: [],
          sections: [
            { id: `m1-${Date.now()}`, badge: '+5.000', title: 'Alunos formados', text: '', listType: 'none', items: [] },
            { id: `m2-${Date.now()}`, badge: '97%', title: 'Taxa de satisfação', text: '', listType: 'none', items: [] },
            { id: `m3-${Date.now()}`, badge: 'R$2M+', title: 'Gerado pelos alunos', text: '', listType: 'none', items: [] },
          ],
        }),
      },
      {
        type: 'bar_chart',
        label: 'Gráfico de barras',
        icon: '📉',
        description: 'Gráfico de barras com dados personalizados',
        color: '#38bdf8',
        factory: () => ({
          type: 'calculator', label: 'GRÁFICO', title: 'Comparação de resultados', subtitle: 'Veja a diferença entre quem aplica e quem não aplica', options: [],
          chartType: 'bar', chartLabels: ['Sem método', 'Com método'], chartValues: [2300, 8900],
          calculatorLabel: '', calculatorUnit: 'R$', calculatorMultiplier: 0,
        }),
      },
    ],
  },
  {
    category: 'Personalização',
    icon: '⚙️',
    color: '#94a3b8',
    items: [
      {
        type: 'spacer',
        label: 'Espaço',
        icon: '↕️',
        description: 'Espaçamento vertical ajustável',
        color: '#94a3b8',
        factory: () => ({
          type: 'bridge', label: 'ESPAÇO', title: '', subtitle: '', options: [], spacerHeight: 40,
        }),
      },
      {
        type: 'html_script',
        label: 'HTML / Script',
        icon: '</> ',
        description: 'Código HTML ou script personalizado',
        color: '#94a3b8',
        factory: () => ({
          type: 'rich', label: 'HTML', title: '', subtitle: '', options: [],
          htmlCode: '<!-- Cole seu HTML aqui -->', sections: [],
        }),
      },
    ],
  },
]

// ── Componente principal ───────────────────────────────────────────────────
interface Props {
  onAdd: (block: Partial<Block>) => void
  isOpen: boolean
  onClose: () => void
}

export default function ComponentsSidebar({ onAdd, isOpen, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null)

  const filteredCatalog = COMPONENT_CATALOG.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      search === '' ||
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0)

  const handleAdd = (comp: ComponentDef) => {
    const block = { ...comp.factory(), id: `${comp.type}-${Date.now()}` } as Partial<Block>
    onAdd(block)
    setRecentlyAdded(comp.type + Date.now())
    setTimeout(() => setRecentlyAdded(null), 800)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
      />

      {/* Sidebar */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: '300px', zIndex: 50,
        background: '#05090f', borderRight: '1px solid #162035',
        display: 'flex', flexDirection: 'column',
        boxShadow: '4px 0 32px rgba(0,0,0,0.6)',
        fontFamily: 'DM Sans, sans-serif',
        animation: 'slideIn 0.2s ease',
      }}>
        <style>{`
          @keyframes slideIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
          .comp-item { transition: all 0.15s ease; cursor: pointer; }
          .comp-item:hover { background: rgba(37,99,255,0.08) !important; border-color: rgba(37,99,255,0.3) !important; transform: translateX(3px); }
          .comp-item:active { transform: scale(0.98); }
          .cat-btn { transition: all 0.15s ease; cursor: pointer; }
          .cat-btn:hover { background: rgba(255,255,255,0.05) !important; }
        `}</style>

        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #0f1a2e' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#eef2ff', letterSpacing: '-0.3px' }}>
                Componentes
              </div>
              <div style={{ fontSize: '10px', color: '#4e6a90', marginTop: '2px' }}>
                {COMPONENT_CATALOG.reduce((acc, c) => acc + c.items.length, 0)} disponíveis · clique para adicionar
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #162035', color: '#4e6a90', borderRadius: '7px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px' }}
            >✕</button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#4e6a90' }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar componente..."
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #162035', borderRadius: '8px', color: '#eef2ff', fontSize: '12px', padding: '8px 10px 8px 30px', outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Category pills */}
        {search === '' && (
          <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid #0f1a2e', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className="cat-btn"
              onClick={() => setActiveCategory(null)}
              style={{ fontSize: '10px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${activeCategory === null ? 'rgba(37,99,255,0.5)' : '#162035'}`, background: activeCategory === null ? 'rgba(37,99,255,0.12)' : 'transparent', color: activeCategory === null ? '#60a5fa' : '#4e6a90', cursor: 'pointer' }}
            >
              Todos
            </button>
            {COMPONENT_CATALOG.map(cat => (
              <button
                key={cat.category}
                className="cat-btn"
                onClick={() => setActiveCategory(activeCategory === cat.category ? null : cat.category)}
                style={{ fontSize: '10px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${activeCategory === cat.category ? `${cat.color}66` : '#162035'}`, background: activeCategory === cat.category ? `${cat.color}15` : 'transparent', color: activeCategory === cat.category ? cat.color : '#4e6a90', cursor: 'pointer' }}
              >
                {cat.icon} {cat.category}
              </button>
            ))}
          </div>
        )}

        {/* Component list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px 20px' }}>
          {filteredCatalog
            .filter(cat => activeCategory === null || cat.category === activeCategory)
            .map(cat => (
              <div key={cat.category} style={{ marginBottom: '16px' }}>
                {/* Category header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', padding: '4px 0' }}>
                  <span style={{ fontSize: '12px' }}>{cat.icon}</span>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: cat.color, textTransform: 'uppercase', letterSpacing: '1px' }}>{cat.category}</span>
                  <div style={{ flex: 1, height: '1px', background: `${cat.color}20` }}/>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {cat.items.map(comp => (
                    <div
                      key={comp.type}
                      className="comp-item"
                      onClick={() => handleAdd(comp)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', borderRadius: '10px',
                        border: '1px solid #0f1a2e', background: 'rgba(255,255,255,0.02)',
                        userSelect: 'none',
                      }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                        background: `${comp.color}15`, border: `1px solid ${comp.color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
                      }}>
                        {comp.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#eef2ff', marginBottom: '2px', letterSpacing: '-0.2px' }}>{comp.label}</div>
                        <div style={{ fontSize: '10px', color: '#4e6a90', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{comp.description}</div>
                      </div>
                      <div style={{ fontSize: '16px', color: `${comp.color}80`, flexShrink: 0 }}>+</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {filteredCatalog.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4e6a90' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px', opacity: 0.4 }}>🔍</div>
              <div style={{ fontSize: '13px' }}>Nenhum componente encontrado</div>
              <div style={{ fontSize: '11px', marginTop: '6px', color: '#2e4560' }}>Tente outro termo de busca</div>
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid #0f1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', flexShrink: 0 }}/>
          <span style={{ fontSize: '10px', color: '#2e4560' }}>Componentes adicionados ao final · arraste para reordenar</span>
        </div>
      </div>
    </>
  )
}