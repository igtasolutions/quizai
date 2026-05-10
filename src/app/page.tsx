import Link from 'next/link'

const plans = [
  {
    name: 'Starter',
    price: 'R$37',
    period: '/mês',
    description: 'Para começar a capturar leads',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.2)',
    border: 'rgba(96,165,250,0.3)',
    features: ['3 quizzes ativos', '1 gerado com IA', '2 criados manualmente', 'Analytics completo', 'Pixel do Facebook'],
    link: 'https://pay.kiwify.com.br/Szu0tR1',
  },
  {
    name: 'Pro',
    price: 'R$67',
    period: '/mês',
    description: 'Para quem já tem tráfego',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.2)',
    border: 'rgba(167,139,250,0.3)',
    features: ['5 quizzes ativos', '3 gerados com IA', '2 criados manualmente', 'Analytics completo', 'Pixel do Facebook'],
    link: 'https://pay.kiwify.com.br/kGP8ct9',
    popular: true,
  },
  {
    name: 'Business',
    price: 'R$97',
    period: '/mês',
    description: 'Para escalar as vendas',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.2)',
    border: 'rgba(52,211,153,0.3)',
    features: ['10 quizzes ativos', '10 gerados com IA', 'Analytics avançado', 'Pixel por quiz', 'Suporte prioritário'],
    link: 'https://pay.kiwify.com.br/3lHzLe2',
  },
  {
    name: 'Agency',
    price: 'R$197',
    period: '/mês',
    description: 'Para agências e produtores',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.2)',
    border: 'rgba(251,191,36,0.3)',
    features: ['50 quizzes ativos', '35 gerados com IA', '15 criados manualmente', 'Analytics avançado', 'Acesso a todas as features'],
    link: 'https://pay.kiwify.com.br/kYeeKhy',
  },
]

const features = [
  { icon: '⚡', title: 'Quiz gerado por IA em 60s', desc: 'Descreva seu produto e a IA monta todos os blocos com copy de alta conversão automaticamente.' },
  { icon: '📊', title: 'Analytics completo', desc: 'Funil por etapa, curva de retenção do vídeo, taxa de chegada ao pitch e muito mais.' },
  { icon: '🎨', title: 'Temas profissionais', desc: '7 temas prontos + personalização completa de cores com preview em tempo real.' },
  { icon: '🎥', title: 'Vídeo com bloqueio inteligente', desc: 'Configure o segundo exato do seu pitch e bloqueie o botão até o lead assistir.' },
  { icon: '🧩', title: 'Blocos ricos e interativos', desc: 'Medidores de score, calculadoras, provas sociais, galerias e muito mais.' },
  { icon: '🔒', title: 'Proteção anti-skip do YouTube', desc: 'Impede que o lead clique no título e saia da sua página durante o vídeo.' },
  { icon: '🎯', title: 'Pixel por quiz', desc: 'Configure eventos de Facebook Pixel e Google Ads separados para cada quiz.' },
  { icon: '📋', title: 'Gestão de leads', desc: 'Visualize, filtre e exporte todos os leads capturados com dados completos.' },
  { icon: '🔗', title: 'Webhook e integrações', desc: 'Conecte com qualquer CRM, plataforma de email ou automação via webhook.' },
]

const testimonials = [
  {
    name: 'Rafael Mendes',
    handle: '@rafaelmendes.mkt',
    avatar: '👨‍💼',
    text: 'Criei meu primeiro quiz em menos de 3 minutos. A IA gerou a copy inteira, os blocos de pergunta, até o pitch final. Nunca vi nada assim no mercado brasileiro.',
    date: 'Março 2026',
    result: '+38% de conversão',
  },
  {
    name: 'Camila Torres',
    handle: '@camilatorres.ads',
    avatar: '👩‍💻',
    text: 'Migrei todos os meus funis para o QuizAI. O analytics de vídeo foi o que me convenceu — via exatamente em qual segundo o lead saía e reescrevi o pitch. Meu CPL caiu pela metade.',
    date: 'Abril 2026',
    result: 'CPL -50%',
  },
  {
    name: 'Diego Alves',
    handle: '@diegoalves.digital',
    avatar: '👨‍🚀',
    text: 'Uso o bloco de calculadora para qualificar leads de consórcio. O lead já chega no WhatsApp sabendo o valor da carta que precisa. Isso mudou completamente a abordagem do meu time.',
    date: 'Fevereiro 2026',
    result: 'Leads 2x mais quentes',
  },
  {
    name: 'Juliana Costa',
    handle: '@julianacosta.afiliada',
    avatar: '👩‍🎯',
    text: 'Sou afiliada e o QuizAI foi o que me faltava. Crio um quiz novo por semana para cada produto diferente. A IA acerta o tom em qualquer nicho. Recomendo sem hesitar.',
    date: 'Janeiro 2026',
    result: '4 quizzes/semana',
  },
]

const forWhom = [
  { icon: '🎓', title: 'Infoprodutores', subtitle: 'Tráfego Qualificado', desc: 'Aumente seu ROI levando tráfego qualificado para o front-end da sua oferta, com quizzes otimizados para converter no ato e maximizar cada clique.', color: '#60a5fa' },
  { icon: '🏢', title: 'Agências', subtitle: 'Escala e Resultado', desc: 'Gerencie múltiplos clientes com o plano Agency. Entregue quizzes de alta conversão com identidade visual personalizada para cada marca.', color: '#a78bfa' },
  { icon: '🚀', title: 'Lançamentos', subtitle: 'Impacto Imediato', desc: 'Crie uma experiência única no lançamento: envolva o público com interatividade, colete dados em tempo real e aumente conversão com um pitch alinhado.', color: '#34d399' },
  { icon: '🤝', title: 'Afiliados', subtitle: 'Diferencial Competitivo', desc: 'Pare de competir com centenas de afiliados enviando o mesmo link direto. Com o quiz, você qualifica o lead antes e chega com autoridade na oferta.', color: '#fbbf24' },
]

const faqs = [
  { q: 'Preciso saber programar para usar o QuizAI?', a: 'Não. O editor é 100% visual. Você arrasta blocos, personaliza textos e publica com um clique. A IA cuida de toda a estrutura e copy do quiz.' },
  { q: 'Como a IA gera o quiz?', a: 'Você preenche um formulário rápido com nome do produto, nicho, promessa e dores do público. Em menos de 60 segundos, a IA gera perguntas, alternativas, blocos de engajamento, VSL e pitch final — tudo com copy otimizada para conversão.' },
  { q: 'Posso usar meu próprio domínio?', a: 'Sim. Nos planos Business e Agency você pode conectar seu domínio personalizado. Nos planos Starter e Pro, você recebe um link no formato quizai.app/seu-quiz.' },
  { q: 'O QuizAI funciona com Kiwify, Hotmart e outras plataformas?', a: 'Sim. O botão de CTA do quiz pode apontar para qualquer link externo — checkout da Kiwify, Hotmart, PerfectPay, ou qualquer outro. O webhook também permite automações avançadas.' },
  { q: 'O que acontece se eu ultrapassar o limite de leads?', a: 'Seu quiz continua funcionando normalmente. Você receberá uma notificação para fazer upgrade do plano. Não bloqueamos seus leads sem aviso.' },
  { q: 'Posso cancelar quando quiser?', a: 'Sim. Sem fidelidade, sem multa. Você cancela direto no painel e a cobrança para no próximo ciclo.' },
  { q: 'Existe período de teste?', a: 'Temos um período de teste gratuito. Após o período, você escolhe o plano que melhor se encaixa no seu volume de quizzes e leads.' },
]

const integrations = ['Kiwify', 'Hotmart', 'PerfectPay', 'Braip', 'Eduzz', 'Monetizze', 'Meta Ads', 'Google Ads', 'Zapier', 'Make', 'ActiveCampaign', 'RD Station']

const niches = ['afiliados', 'VSL', 'lançamentos', 'mentoria', 'cursos', 'ecommerce', 'consórcio', 'consultoria', 'saúde', 'fitness', 'imóveis', 'seguros', 'finanças', 'gamificação', 'storytelling', 'digital influencer', 'coaching', 'concursos']

export default function LandingPage() {
  return (
    <div style={{ background: '#05090f', color: '#eef2ff', fontFamily: 'DM Sans, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@300;400;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pulse-glow { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes scroll-left { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes scroll-right { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
        .shimmer-text {
          background: linear-gradient(90deg, #60a5fa 0%, #fff 40%, #a78bfa 60%, #60a5fa 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
          font-weight: 300;
        }
        .card-hover { transition: all .3s ease; }
        .card-hover:hover { transform: translateY(-4px); }
        .float { animation: float 4s ease-in-out infinite; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #2563ff, #1d4ed8);
          color: #fff; font-family: 'DM Sans', sans-serif; font-weight: 600;
          letter-spacing: .1px; border-radius: 10px; text-decoration: none;
          box-shadow: 0 0 32px rgba(37,99,255,.35); transition: all .2s ease;
          border: none; cursor: pointer;
        }
        .btn-primary:hover { box-shadow: 0 0 52px rgba(37,99,255,.55); transform: translateY(-1px); }
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09);
          color: #7a9ab8; font-family: 'DM Sans', sans-serif; font-weight: 500;
          border-radius: 10px; text-decoration: none; transition: all .2s ease; cursor: pointer;
        }
        .btn-secondary:hover { background: rgba(255,255,255,.08); color: #eef2ff; border-color: rgba(255,255,255,.18); }
        .marquee-wrap { overflow: hidden; mask: linear-gradient(90deg, transparent, black 8%, black 92%, transparent); }
        .marquee-left { display: flex; gap: 12px; animation: scroll-left 30s linear infinite; width: max-content; }
        .marquee-right { display: flex; gap: 12px; animation: scroll-right 36s linear infinite; width: max-content; }
        .section-label { font-size: 11px; color: #60a5fa; text-transform: uppercase; letter-spacing: 2.5px; font-weight: 500; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
        .section-label::before { content: '—'; color: rgba(96,165,250,.35); }
        details > summary { list-style: none; cursor: pointer; }
        details > summary::-webkit-details-marker { display: none; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,9,15,.92)', borderBottom: '1px solid rgba(15,26,46,.9)', backdropFilter: 'blur(24px)', padding: '0 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-1px', fontFamily: 'Syne, sans-serif' }}>
            Quiz<span style={{ color: '#60a5fa' }}>AI</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {[['#funciona', 'Como funciona'], ['#planos', 'Planos'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: '#4e6a90', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>{label}</a>
            ))}
            <Link href="/auth/login" style={{ color: '#4e6a90', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>Entrar</Link>
            <Link href="/auth/login" className="btn-primary" style={{ fontSize: '13px', padding: '8px 18px', borderRadius: '8px' }}>Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '90px 24px 80px' }}>
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '1000px', height: '700px', background: 'radial-gradient(ellipse, rgba(37,99,255,.1) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: '200px', left: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(124,58,237,.07) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37,99,255,.08)', border: '1px solid rgba(37,99,255,.25)', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: '#60a5fa', fontWeight: '500', marginBottom: '32px', letterSpacing: '.3px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa', animation: 'pulse-glow 2s ease infinite' }}/>
            IA que gera quiz de vendas em 60 segundos
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 7vw, 76px)', fontWeight: '300', lineHeight: '1.06', letterSpacing: '-2.5px', fontFamily: 'Syne, sans-serif', marginBottom: '28px', color: '#e8eeff' }}>
            Transforme tráfego em{' '}
            <span className="shimmer-text">leads qualificados</span>
            {' '}com quiz de vendas
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#4e6a90', lineHeight: '1.75', maxWidth: '560px', margin: '0 auto 44px', fontWeight: '400' }}>
            Crie quiz de vendas completo com copy de alta conversão, analytics avançado e blocos interativos — tudo em menos de 60 segundos com IA.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/login" className="btn-primary" style={{ fontSize: '16px', padding: '16px 36px', borderRadius: '12px', boxShadow: '0 0 48px rgba(37,99,255,.4)' }}>
              ⚡ Criar meu quiz grátis
            </Link>
            <a href="#planos" className="btn-secondary" style={{ fontSize: '16px', padding: '16px 28px', borderRadius: '12px' }}>
              Ver planos →
            </a>
          </div>
          <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', flexWrap: 'wrap' }}>
            {['Sem cartão de crédito', 'Setup em 2 minutos', 'Cancele quando quiser'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4e6a90' }}>
                <span style={{ color: '#22c55e', fontSize: '11px' }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>

        {/* Mockup */}
        <div className="float" style={{ maxWidth: '380px', margin: '64px auto 0', position: 'relative', zIndex: 1 }}>
          <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 0 80px rgba(37,99,255,.15), 0 40px 80px rgba(0,0,0,.5)' }}>
            <div style={{ background: 'rgba(10,17,32,.97)', borderBottom: '1px solid #162035', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'Syne, sans-serif' }}>Quiz<span style={{ color: '#60a5fa' }}>AI</span></span>
              <div style={{ flex: 1, height: '3px', background: '#162035', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg, #2563ff, #60a5fa)', borderRadius: '2px' }}/>
              </div>
              <span style={{ fontSize: '10px', color: '#4e6a90' }}>03/05</span>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '9px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 6px #60a5fa' }}/>
                DIAGNÓSTICO FINANCEIRO
              </div>
              <div style={{ background: 'rgba(37,99,255,.06)', border: '1px solid rgba(37,99,255,.15)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'Syne, sans-serif', lineHeight: '1.3', marginBottom: '6px' }}>
                  Por que você <span style={{ color: '#60a5fa' }}>não consegue</span> guardar dinheiro mesmo ganhando bem?
                </div>
                <div style={{ fontSize: '10px', color: '#4e6a90' }}>Responda 5 perguntas e receba seu diagnóstico personalizado</div>
              </div>
              {['Gasto mais do que ganho sem perceber', 'Não tenho controle dos gastos', 'Falta planejamento financeiro'].map((opt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${i === 1 ? '#2563ff' : '#162035'}`, background: i === 1 ? 'rgba(37,99,255,.1)' : 'rgba(13,24,41,.8)', marginBottom: '6px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `1.5px solid ${i === 1 ? '#2563ff' : '#4e6a90'}`, background: i === 1 ? '#2563ff' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: i === 1 ? '#fff' : '#4e6a90', flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#eef2ff' }}>{opt}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '80px', background: 'radial-gradient(ellipse, rgba(37,99,255,.25) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        </div>
      </section>

      {/* LOGOS MARQUEE */}
      <section style={{ padding: '40px 0', borderTop: '1px solid #0f1a2e', borderBottom: '1px solid #0f1a2e', background: 'rgba(10,17,32,.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '11px', color: '#2e4560', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '500' }}>
          Integra com as principais plataformas do mercado
        </div>
        <div className="marquee-wrap">
          <div className="marquee-left">
            {[...integrations, ...integrations].map((name, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,.03)', border: '1px solid #0f1a2e', borderRadius: '8px', padding: '10px 20px', whiteSpace: 'nowrap', fontSize: '13px', color: '#4e6a90', fontWeight: '500' }}>{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="funciona" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Como funciona</div>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: '300', fontFamily: 'Syne, sans-serif', letterSpacing: '-1.5px', color: '#e8eeff', marginBottom: '16px' }}>
              Quiz de vendas pronto em <span className="shimmer-text">3 passos</span>
            </h2>
            <p style={{ fontSize: '15px', color: '#4e6a90', maxWidth: '480px', margin: '0 auto', lineHeight: '1.7' }}>
              Qualquer pessoa consegue criar. Sem técnico, sem designer, sem copywriter.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2px', background: '#0f1a2e', borderRadius: '20px', overflow: 'hidden' }}>
            {[
              { num: '01', icon: '📝', title: 'Descreva seu produto', desc: 'Preencha nome do produto, nicho, promessa, dores do público e benefícios. Leva menos de 2 minutos.', color: '#60a5fa' },
              { num: '02', icon: '🤖', title: 'A IA gera tudo', desc: 'Em 60 segundos a IA cria perguntas, alternativas, copy de engajamento, VSL e pitch final prontos para converter.', color: '#a78bfa' },
              { num: '03', icon: '🚀', title: 'Publique e venda', desc: 'Copie o link gerado, envie para o seu tráfego e veja os leads chegando qualificados em tempo real.', color: '#34d399' },
            ].map((step, i) => (
              <div key={i} style={{ background: '#0a1120', padding: '40px 32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${step.color}44, ${step.color}, ${step.color}44)` }}/>
                <div style={{ fontSize: '52px', fontWeight: '300', fontFamily: 'Syne, sans-serif', color: `${step.color}20`, lineHeight: 1, marginBottom: '20px', letterSpacing: '-2px' }}>{step.num}</div>
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{step.icon}</div>
                <div style={{ fontSize: '17px', fontWeight: '600', color: '#eef2ff', marginBottom: '10px', letterSpacing: '-.2px' }}>{step.title}</div>
                <div style={{ fontSize: '13px', color: '#4e6a90', lineHeight: '1.7' }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS ALTERNADOS */}
      <section style={{ padding: '0 24px 96px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '80px' }}>

          {/* 1 — Leads qualificados */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '60px', alignItems: 'center' }}>
            <div>
              <div className="section-label">Resultado real</div>
              <h3 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: '300', fontFamily: 'Syne, sans-serif', letterSpacing: '-1px', color: '#e8eeff', lineHeight: '1.2', marginBottom: '16px' }}>
                Leads que chegam <span className="shimmer-text">prontos para comprar</span>
              </h3>
              <p style={{ fontSize: '15px', color: '#4e6a90', lineHeight: '1.75', fontWeight: '400', marginBottom: '28px', maxWidth: '460px' }}>
                O quiz qualifica o lead antes de ele ver a oferta. Quando chega no pitch, ele já entendeu o problema, se identificou com a solução e criou expectativa. Você não convence mais — só confirma.
              </p>
              <Link href="/auth/login" className="btn-primary" style={{ fontSize: '14px', padding: '12px 24px' }}>Criar meu quiz →</Link>
            </div>
            <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(96,165,250,.07) 0%, transparent 70%)', pointerEvents: 'none' }}/>
              <div style={{ fontSize: '12px', color: '#4e6a90', marginBottom: '20px', fontWeight: '500' }}>Funil de leads — Quiz Financeiro</div>
              {[
                { label: 'Iniciaram o quiz', value: '2.847', pct: 100, color: '#60a5fa' },
                { label: 'Chegaram ao vídeo', value: '2.190', pct: 77, color: '#a78bfa' },
                { label: 'Assistiram até o pitch', value: '1.643', pct: 58, color: '#34d399' },
                { label: 'Clicaram no CTA', value: '724', pct: 25, color: '#fbbf24' },
              ].map((row, i) => (
                <div key={i} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#8ca8cc' }}>{row.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: row.color }}>{row.value}</span>
                  </div>
                  <div style={{ height: '4px', background: '#162035', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${row.pct}%`, background: row.color, borderRadius: '2px', boxShadow: `0 0 8px ${row.color}60` }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2 — Analytics de vídeo (invertido) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '60px', alignItems: 'center' }}>
            <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '20px', padding: '28px' }}>
              <div style={{ fontSize: '12px', color: '#4e6a90', marginBottom: '16px', fontWeight: '500' }}>Retenção de vídeo — segundo a segundo</div>
              <div style={{ position: 'relative', height: '120px', marginBottom: '16px' }}>
                <svg width="100%" height="120" viewBox="0 0 400 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M0,20 C50,18 80,22 120,30 C160,38 180,45 200,50 C220,55 240,90 260,95 C280,100 320,98 360,60 C380,45 400,30 400,25 L400,120 L0,120 Z" fill="url(#chartGrad)"/>
                  <path d="M0,20 C50,18 80,22 120,30 C160,38 180,45 200,50 C220,55 240,90 260,95 C280,100 320,98 360,60 C380,45 400,30 400,25" fill="none" stroke="#a78bfa" strokeWidth="2"/>
                  <line x1="260" y1="0" x2="260" y2="120" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" opacity="0.6"/>
                  <text x="264" y="14" fill="#fbbf24" fontSize="9" fontFamily="DM Sans, sans-serif">📍 Pitch aqui</text>
                </svg>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[{ label: 'Retenção média', val: '73%', color: '#a78bfa' }, { label: 'Chegaram ao pitch', val: '58%', color: '#34d399' }, { label: 'Clicaram no CTA', val: '25%', color: '#fbbf24' }].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', background: 'rgba(255,255,255,.03)', border: '1px solid #162035', borderRadius: '10px', padding: '12px 8px' }}>
                    <div style={{ fontSize: '20px', fontWeight: '300', fontFamily: 'Syne', color: s.color, letterSpacing: '-1px' }}>{s.val}</div>
                    <div style={{ fontSize: '10px', color: '#4e6a90', marginTop: '4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="section-label">Analytics de vídeo</div>
              <h3 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: '300', fontFamily: 'Syne, sans-serif', letterSpacing: '-1px', color: '#e8eeff', lineHeight: '1.2', marginBottom: '16px' }}>
                Veja em qual <span className="shimmer-text">segundo o lead abandona</span>
              </h3>
              <p style={{ fontSize: '15px', color: '#4e6a90', lineHeight: '1.75', fontWeight: '400', marginBottom: '28px', maxWidth: '460px' }}>
                O QuizAI monitora a retenção do seu VSL segundo a segundo. Você descobre onde o lead perde o interesse, reescreve o trecho e vê a conversão subir. Nenhuma ferramenta no Brasil faz isso dentro do quiz.
              </p>
              <Link href="/auth/login" className="btn-primary" style={{ fontSize: '14px', padding: '12px 24px' }}>Ver no demo →</Link>
            </div>
          </div>

          {/* 3 — Blocos ricos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '60px', alignItems: 'center' }}>
            <div>
              <div className="section-label">Blocos interativos</div>
              <h3 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: '300', fontFamily: 'Syne, sans-serif', letterSpacing: '-1px', color: '#e8eeff', lineHeight: '1.2', marginBottom: '16px' }}>
                Mais do que perguntas. <span className="shimmer-text">Uma experiência</span>
              </h3>
              <p style={{ fontSize: '15px', color: '#4e6a90', lineHeight: '1.75', fontWeight: '400', marginBottom: '20px', maxWidth: '460px' }}>
                Calculadoras de score, medidores de perfil, provas sociais dinâmicas, cronômetros de urgência. Cada bloco foi criado para manter o lead engajado e aumentar o tempo de sessão.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
                {['Calculadora', 'Score', 'VSL', 'Countdown', 'Galeria', 'Depoimento', 'Resultado personalizado'].map(tag => (
                  <span key={tag} style={{ fontSize: '11px', color: '#60a5fa', background: 'rgba(96,165,250,.08)', border: '1px solid rgba(96,165,250,.2)', borderRadius: '20px', padding: '4px 12px', fontWeight: '500' }}>{tag}</span>
                ))}
              </div>
              <Link href="/auth/login" className="btn-primary" style={{ fontSize: '14px', padding: '12px 24px' }}>Explorar blocos →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { icon: '🧮', label: 'Calculadora', desc: 'Score em tempo real', color: '#60a5fa' },
                { icon: '📊', label: 'Medidor', desc: 'Perfil do lead', color: '#a78bfa' },
                { icon: '🎥', label: 'VSL Bloqueado', desc: 'Pitch com lock', color: '#34d399' },
                { icon: '⏱️', label: 'Countdown', desc: 'Urgência real', color: '#fbbf24' },
                { icon: '💬', label: 'Depoimento', desc: 'Prova social', color: '#f87171' },
                { icon: '🎯', label: 'Resultado', desc: 'Personalizado por perfil', color: '#34d399' },
              ].map((b, i) => (
                <div key={i} className="card-hover" style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '12px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1.5px', background: `linear-gradient(90deg, transparent, ${b.color}60, transparent)` }}/>
                  <div style={{ fontSize: '22px', marginBottom: '8px' }}>{b.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#eef2ff', marginBottom: '3px' }}>{b.label}</div>
                  <div style={{ fontSize: '10px', color: '#4e6a90' }}>{b.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES GRID */}
      <section style={{ padding: '96px 24px', background: 'rgba(10,17,32,.4)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Funcionalidades</div>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: '300', fontFamily: 'Syne, sans-serif', letterSpacing: '-1.5px', color: '#e8eeff', marginBottom: '14px' }}>
              Tudo que você precisa para <span className="shimmer-text">converter mais</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {features.map((f, i) => (
              <div key={i} className="card-hover" style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1.5px', background: 'linear-gradient(90deg, transparent, rgba(37,99,255,.4), transparent)' }}/>
                <div style={{ fontSize: '26px', marginBottom: '14px' }}>{f.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#eef2ff', marginBottom: '8px', letterSpacing: '-.2px' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: '#4e6a90', lineHeight: '1.65' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Para quem é</div>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: '300', fontFamily: 'Syne, sans-serif', letterSpacing: '-1.5px', color: '#e8eeff', marginBottom: '14px' }}>
              Para quem <span className="shimmer-text">transforma tráfego</span> em resultado
            </h2>
            <p style={{ fontSize: '15px', color: '#4e6a90', maxWidth: '480px', margin: '0 auto', lineHeight: '1.7' }}>
              O QuizAI serve qualquer estratégia digital que precise qualificar leads antes da oferta
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {forWhom.map((item, i) => (
              <div key={i} className="card-hover" style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '20px', padding: '32px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${item.color}80, transparent)` }}/>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', background: `radial-gradient(circle, ${item.color}10 0%, transparent 70%)` }}/>
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>{item.icon}</div>
                <div style={{ fontSize: '10px', color: item.color, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600', marginBottom: '8px' }}>{item.subtitle}</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#eef2ff', marginBottom: '12px', letterSpacing: '-.2px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', color: '#4e6a90', lineHeight: '1.7' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NICHOS MARQUEE */}
      <section style={{ padding: '56px 0', background: 'rgba(10,17,32,.5)', borderTop: '1px solid #0f1a2e', borderBottom: '1px solid #0f1a2e' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px', fontSize: '12px', color: '#3a5270', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Funciona para todos os nichos do mercado digital
        </div>
        <div className="marquee-wrap" style={{ marginBottom: '10px' }}>
          <div className="marquee-left">
            {[...niches, ...niches].map((n, i) => (
              <span key={i} style={{ fontSize: '12px', color: '#4e6a90', background: 'rgba(255,255,255,.03)', border: '1px solid #162035', borderRadius: '20px', padding: '6px 16px', whiteSpace: 'nowrap', fontWeight: '500' }}>{n}</span>
            ))}
          </div>
        </div>
        <div className="marquee-wrap">
          <div className="marquee-right">
            {[...niches.slice().reverse(), ...niches.slice().reverse()].map((n, i) => (
              <span key={i} style={{ fontSize: '12px', color: '#2e4560', background: 'rgba(255,255,255,.02)', border: '1px solid #0f1a2e', borderRadius: '20px', padding: '6px 16px', whiteSpace: 'nowrap', fontWeight: '500' }}>{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Depoimentos</div>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: '300', fontFamily: 'Syne, sans-serif', letterSpacing: '-1.5px', color: '#e8eeff', marginBottom: '14px' }}>
              Resultados de quem <span className="shimmer-text">já usa o QuizAI</span>
            </h2>
            <p style={{ fontSize: '15px', color: '#4e6a90', maxWidth: '440px', margin: '0 auto' }}>
              Casos reais de produtores que testaram e hoje dependem do QuizAI para escalar
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {testimonials.map((t, i) => (
              <div key={i} className="card-hover" style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1.5px', background: 'linear-gradient(90deg, transparent, rgba(96,165,250,.3), transparent)' }}/>
                <div style={{ fontSize: '32px', color: '#60a5fa', marginBottom: '16px', opacity: '.3', fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</div>
                <p style={{ fontSize: '14px', color: '#c8d8ee', lineHeight: '1.75', marginBottom: '24px', flex: 1, fontWeight: '400' }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(37,99,255,.1)', border: '1px solid rgba(37,99,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#eef2ff' }}>{t.name}</div>
                      <div style={{ fontSize: '11px', color: '#4e6a90' }}>{t.handle}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#34d399', background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.2)', borderRadius: '6px', padding: '3px 8px' }}>{t.result}</div>
                    <div style={{ fontSize: '10px', color: '#2e4560', marginTop: '4px' }}>{t.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRAÇÕES */}
      <section style={{ padding: '80px 24px', background: 'rgba(10,17,32,.4)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>Integrações</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: '300', fontFamily: 'Syne, sans-serif', letterSpacing: '-1.5px', color: '#e8eeff', marginBottom: '16px' }}>
            Conecta com o seu <span className="shimmer-text">ecossistema digital</span>
          </h2>
          <p style={{ fontSize: '14px', color: '#4e6a90', marginBottom: '48px', lineHeight: '1.7', maxWidth: '460px', margin: '0 auto 48px' }}>
            O QuizAI se integra com checkouts, CRMs, plataformas de email e ferramentas de automação via webhook nativo.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {integrations.map((name, i) => (
              <div key={i} style={{ fontSize: '13px', color: '#8ca8cc', background: 'rgba(255,255,255,.04)', border: '1px solid #162035', borderRadius: '10px', padding: '10px 20px', fontWeight: '500' }}>{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" style={{ padding: '96px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '900px', height: '700px', background: 'radial-gradient(ellipse, rgba(37,99,255,.05) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Planos</div>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: '300', fontFamily: 'Syne, sans-serif', letterSpacing: '-1.5px', color: '#e8eeff', marginBottom: '14px' }}>
              Planos para todo tipo de negócio
            </h2>
            <p style={{ fontSize: '14px', color: '#4e6a90' }}>Cancele quando quiser. Sem taxas ocultas. Sem fidelidade.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '40px' }}>
            {plans.map((plan, i) => (
              <div key={i} className="card-hover" style={{ background: '#0a1120', border: `1px solid ${plan.popular ? plan.border : '#162035'}`, borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden', boxShadow: plan.popular ? `0 0 40px ${plan.glow}` : 'none' }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: '16px', right: '16px', background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, color: '#fff', fontSize: '9px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', letterSpacing: '.5px' }}>MAIS POPULAR</div>
                )}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${plan.color}80, transparent)` }}/>
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', background: `radial-gradient(circle, ${plan.glow} 0%, transparent 70%)`, pointerEvents: 'none' }}/>
                <div style={{ fontSize: '14px', fontWeight: '700', color: plan.color, marginBottom: '6px' }}>{plan.name}</div>
                <div style={{ fontSize: '12px', color: '#4e6a90', marginBottom: '20px' }}>{plan.description}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '38px', fontWeight: '300', fontFamily: 'Syne, sans-serif', color: '#eef2ff', lineHeight: 1, letterSpacing: '-1.5px' }}>{plan.price}</span>
                  <span style={{ fontSize: '13px', color: '#4e6a90', marginBottom: '4px' }}>{plan.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {plan.features.map((f, fi) => (
                    <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c8d8ee' }}>
                      <span style={{ color: plan.color, fontWeight: '600', flexShrink: 0, fontSize: '12px' }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <a href={plan.link} target="_blank" style={{ display: 'block', width: '100%', background: plan.popular ? `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)` : 'rgba(255,255,255,.04)', border: plan.popular ? 'none' : `1px solid ${plan.border}`, color: '#fff', fontFamily: 'DM Sans, sans-serif', fontWeight: '600', fontSize: '14px', padding: '13px', borderRadius: '10px', textDecoration: 'none', textAlign: 'center', cursor: 'pointer', boxShadow: plan.popular ? `0 0 24px ${plan.glow}` : 'none', letterSpacing: '.1px', transition: 'all .2s' }}>
                  Começar agora →
                </a>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
            {[{ icon: '🔒', label: 'Pagamento 100% seguro' }, { icon: '📋', label: 'Conformidade com LGPD' }, { icon: '⚡', label: 'Acesso imediato' }, { icon: '↩️', label: '7 dias de garantia' }].map((seal, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#4e6a90', fontWeight: '500' }}>
                <span style={{ fontSize: '16px' }}>{seal.icon}</span> {seal.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '80px 24px', background: 'rgba(10,17,32,.4)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Dúvidas</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: '300', fontFamily: 'Syne, sans-serif', letterSpacing: '-1.5px', color: '#e8eeff' }}>
              Perguntas frequentes
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {faqs.map((faq, i) => (
              <details key={i} style={{ background: '#0a1120', borderRadius: i === 0 ? '16px 16px 4px 4px' : i === faqs.length - 1 ? '4px 4px 16px 16px' : '4px', border: '1px solid #162035', overflow: 'hidden' }}>
                <summary style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: '600', color: '#eef2ff', cursor: 'pointer', userSelect: 'none', letterSpacing: '-.2px' }}>
                  {faq.q}
                  <span style={{ color: '#4e6a90', fontSize: '20px', fontWeight: '300', flexShrink: 0, marginLeft: '16px', lineHeight: 1 }}>+</span>
                </summary>
                <div style={{ padding: '0 24px 20px', fontSize: '14px', color: '#4e6a90', lineHeight: '1.75', fontWeight: '400' }}>{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '600px', background: 'radial-gradient(ellipse, rgba(37,99,255,.1) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37,99,255,.08)', border: '1px solid rgba(37,99,255,.2)', borderRadius: '20px', padding: '6px 16px', fontSize: '11px', color: '#60a5fa', fontWeight: '500', marginBottom: '28px', letterSpacing: '.3px' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 6px #60a5fa', animation: 'pulse-glow 2s ease infinite' }}/>
            Setup em menos de 2 minutos
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 56px)', fontWeight: '300', fontFamily: 'Syne, sans-serif', letterSpacing: '-2px', marginBottom: '20px', lineHeight: '1.06', color: '#e8eeff' }}>
            Pronto para criar seu<br/>
            <span className="shimmer-text">quiz de vendas?</span>
          </h2>
          <p style={{ fontSize: '15px', color: '#4e6a90', marginBottom: '40px', lineHeight: '1.7' }}>
            Mais de 60 segundos você não precisa. A IA faz tudo — copy, perguntas, blocos e pitch.
          </p>
          <Link href="/auth/login" className="btn-primary" style={{ fontSize: '17px', padding: '18px 48px', borderRadius: '14px', boxShadow: '0 0 60px rgba(37,99,255,.45)' }}>
            ⚡ Criar meu primeiro quiz
          </Link>
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#2e4560' }}>
            Sem cartão de crédito · Acesso imediato · Cancele quando quiser
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #0f1a2e', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px', marginBottom: '48px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-1px', fontFamily: 'Syne, sans-serif', marginBottom: '12px' }}>
                Quiz<span style={{ color: '#60a5fa' }}>AI</span>
              </div>
              <p style={{ fontSize: '13px', color: '#2e4560', lineHeight: '1.7', maxWidth: '200px' }}>
                A plataforma de quiz de vendas com IA para produtores digitais brasileiros.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', fontWeight: '600' }}>Produto</div>
              {['Como funciona', 'Funcionalidades', 'Planos', 'Integrações'].map(l => (
                <div key={l} style={{ marginBottom: '10px' }}><a href="#" style={{ fontSize: '13px', color: '#2e4560', textDecoration: 'none' }}>{l}</a></div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', fontWeight: '600' }}>Empresa</div>
              {['Sobre', 'Blog', 'Suporte', 'Contato'].map(l => (
                <div key={l} style={{ marginBottom: '10px' }}><a href="#" style={{ fontSize: '13px', color: '#2e4560', textDecoration: 'none' }}>{l}</a></div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', fontWeight: '600' }}>Legal</div>
              {['Termos de uso', 'Política de privacidade', 'LGPD'].map(l => (
                <div key={l} style={{ marginBottom: '10px' }}><a href="#" style={{ fontSize: '13px', color: '#2e4560', textDecoration: 'none' }}>{l}</a></div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #0f1a2e', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '12px', color: '#1e3050' }}>© 2026 QuizAI · Todos os direitos reservados</div>
            <div style={{ fontSize: '12px', color: '#1e3050' }}>Feito no Brasil 🇧🇷</div>
          </div>
        </div>
      </footer>
    </div>
  )
}