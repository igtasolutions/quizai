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
  { icon: '⚡', title: 'Quiz gerado por IA em 60 segundos', desc: 'Descreva seu produto e a IA monta todos os blocos com copy de alta conversão automaticamente.' },
  { icon: '📊', title: 'Analytics completo de leads', desc: 'Funil por etapa, curva de retenção do vídeo, taxa de chegada ao pitch e muito mais.' },
  { icon: '🎨', title: 'Temas visuais profissionais', desc: '7 temas prontos + personalização completa de cores com preview em tempo real.' },
  { icon: '🎥', title: 'Vídeo com bloqueio inteligente', desc: 'Configure o segundo exato do seu pitch e bloqueie o botão até o lead assistir.' },
  { icon: '🧩', title: 'Blocos ricos e interativos', desc: 'Medidores de score, calculadoras, provas sociais, galerias e muito mais.' },
  { icon: '🔒', title: 'Proteção anti-skip do YouTube', desc: 'Impede que o lead clique no título e saia da sua página durante o vídeo.' },
]

export default function LandingPage() {
  return (
    <div style={{ background: '#05090f', color: '#eef2ff', fontFamily: 'DM Sans, sans-serif', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulse-glow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes gradient-x { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .shimmer-text {
          background: linear-gradient(90deg, #60a5fa 0%, #ffffff 40%, #a78bfa 60%, #60a5fa 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .gradient-border {
          background: linear-gradient(135deg, #2563ff, #7c3aed, #2563ff);
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); }
        .float { animation: float 4s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.8s ease forwards; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,9,15,0.9)', borderBottom: '1px solid #162035', backdropFilter: 'blur(20px)', padding: '0 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-1px', fontFamily: 'Syne, sans-serif' }}>
            Quiz<span style={{ color: '#60a5fa' }}>AI</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/auth/login" style={{ color: '#4e6a90', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>Entrar</Link>
            <Link href="/auth/login" style={{ background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontSize: '13px', fontWeight: '700', padding: '8px 18px', borderRadius: '8px', textDecoration: 'none', boxShadow: '0 0 16px rgba(37,99,255,0.3)', fontFamily: 'Syne, sans-serif' }}>
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px 100px' }}>
        {/* Glows de fundo */}
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '600px', background: 'radial-gradient(ellipse, rgba(37,99,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: '200px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: '100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.3)', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: '#60a5fa', fontWeight: '600', marginBottom: '28px', letterSpacing: '0.5px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa', animation: 'pulse-glow 2s ease infinite' }}/>
            IA que gera quiz de vendas em 60 segundos
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: '800', lineHeight: '1.1', letterSpacing: '-2px', fontFamily: 'Syne, sans-serif', marginBottom: '24px' }}>
            Transforme tráfego em{' '}
            <span className="shimmer-text">leads qualificados</span>
            {' '}com quiz de vendas
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#4e6a90', lineHeight: '1.7', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Crie quiz de vendas completo com copy de alta conversão, analytics avançado e blocos interativos — tudo em menos de 60 segundos com IA.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '16px', padding: '16px 32px', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 0 40px rgba(37,99,255,0.4)', letterSpacing: '-0.3px' }}>
              ⚡ Criar meu quiz grátis
            </Link>
            <a href="#planos" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid #162035', color: '#eef2ff', fontFamily: 'Syne, sans-serif', fontWeight: '600', fontSize: '16px', padding: '16px 32px', borderRadius: '12px', textDecoration: 'none', letterSpacing: '-0.3px' }}>
              Ver planos →
            </a>
          </div>

          {/* Social proof */}
          <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {['Sem cartão de crédito', 'Setup em 2 minutos', 'Cancele quando quiser'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4e6a90' }}>
                <span style={{ color: '#22c55e' }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>

        {/* MOCKUP DO QUIZ */}
        <div className="float" style={{ maxWidth: '360px', margin: '60px auto 0', position: 'relative', zIndex: 1 }}>
          <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 0 80px rgba(37,99,255,0.15), 0 40px 80px rgba(0,0,0,0.5)' }}>
            {/* Header quiz */}
            <div style={{ background: 'rgba(10,17,32,0.97)', borderBottom: '1px solid #162035', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'Syne, sans-serif' }}>Quiz<span style={{ color: '#60a5fa' }}>AI</span></span>
              <div style={{ flex: 1, height: '3px', background: '#162035', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg, #2563ff, #60a5fa)', borderRadius: '2px' }}/>
              </div>
              <span style={{ fontSize: '10px', color: '#4e6a90' }}>03/05</span>
            </div>
            {/* Conteúdo */}
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '9px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 6px #60a5fa' }}/>
                DIAGNÓSTICO FINANCEIRO
              </div>
              <div style={{ background: 'rgba(37,99,255,0.06)', border: '1px solid rgba(37,99,255,0.15)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '15px', fontWeight: '800', fontFamily: 'Syne, sans-serif', lineHeight: '1.3', marginBottom: '6px' }}>
                  Por que você <span style={{ color: '#60a5fa' }}>não consegue</span> guardar dinheiro mesmo ganhando bem?
                </div>
                <div style={{ fontSize: '10px', color: '#4e6a90' }}>Responda 5 perguntas e receba seu diagnóstico personalizado</div>
              </div>
              {['Gasto mais do que ganho sem perceber', 'Não tenho controle dos gastos', 'Falta planejamento financeiro'].map((opt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${i === 1 ? '#2563ff' : '#162035'}`, background: i === 1 ? 'rgba(37,99,255,0.1)' : 'rgba(13,24,41,0.8)', marginBottom: '6px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `1.5px solid ${i === 1 ? '#2563ff' : '#4e6a90'}`, background: i === 1 ? '#2563ff' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: i === 1 ? '#fff' : '#4e6a90', flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#eef2ff' }}>{opt}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Glow embaixo do mockup */}
          <div style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '80px', background: 'radial-gradient(ellipse, rgba(37,99,255,0.3) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ fontSize: '12px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', fontWeight: '600' }}>Funcionalidades</div>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', fontFamily: 'Syne, sans-serif', letterSpacing: '-1px', marginBottom: '16px' }}>
              Tudo que você precisa para{' '}
              <span className="shimmer-text">converter mais</span>
            </h2>
            <p style={{ fontSize: '16px', color: '#4e6a90', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
              O QuizAI tem tudo que um quiz de vendas de alta conversão precisa
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {features.map((f, i) => (
              <div key={i} className="card-hover" style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(37,99,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}/>
                <div style={{ fontSize: '32px', marginBottom: '14px' }}>{f.icon}</div>
                <div style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: '#4e6a90', lineHeight: '1.6' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{ padding: '80px 24px', background: 'rgba(10,17,32,0.5)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', fontWeight: '600' }}>Como funciona</div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', fontFamily: 'Syne, sans-serif', letterSpacing: '-1px', marginBottom: '60px' }}>
            Quiz pronto em <span className="shimmer-text">3 passos</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            {[
              { num: '01', title: 'Descreva seu produto', desc: 'Nome, nicho, promessa, dores e benefícios do seu infoproduto' },
              { num: '02', title: 'IA gera tudo', desc: 'Em 60 segundos a IA cria todos os blocos com copy de alta conversão' },
              { num: '03', title: 'Publique e venda', desc: 'Copie o link e compartilhe com seu tráfego. Simples assim.' },
            ].map((step, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <div style={{ fontSize: '56px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: 'rgba(37,99,255,0.15)', lineHeight: 1, marginBottom: '12px' }}>{step.num}</div>
                <div style={{ fontSize: '17px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '8px' }}>{step.title}</div>
                <div style={{ fontSize: '13px', color: '#4e6a90', lineHeight: '1.6' }}>{step.desc}</div>
                {i < 2 && (
                  <div style={{ position: 'absolute', top: '28px', right: '-16px', color: '#162035', fontSize: '24px', display: 'none' }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" style={{ padding: '80px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '600px', background: 'radial-gradient(ellipse, rgba(37,99,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ fontSize: '12px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', fontWeight: '600' }}>Planos</div>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', fontFamily: 'Syne, sans-serif', letterSpacing: '-1px', marginBottom: '16px' }}>
              Escolha seu plano
            </h2>
            <p style={{ fontSize: '16px', color: '#4e6a90' }}>Cancele quando quiser. Sem taxas ocultas.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {plans.map((plan, i) => (
              <div key={i} className="card-hover" style={{ background: '#0a1120', border: `1px solid ${plan.popular ? plan.border : '#162035'}`, borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden', boxShadow: plan.popular ? `0 0 40px ${plan.glow}` : 'none' }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: '16px', right: '16px', background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, color: '#fff', fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', fontFamily: 'Syne, sans-serif' }}>
                    MAIS POPULAR
                  </div>
                )}
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', background: `radial-gradient(circle, ${plan.glow} 0%, transparent 70%)`, pointerEvents: 'none' }}/>

                <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: plan.color, marginBottom: '6px' }}>{plan.name}</div>
                <div style={{ fontSize: '13px', color: '#4e6a90', marginBottom: '20px' }}>{plan.description}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '40px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ fontSize: '14px', color: '#4e6a90', marginBottom: '4px' }}>{plan.period}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {plan.features.map((f, fi) => (
                    <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#eef2ff' }}>
                      <span style={{ color: plan.color, fontWeight: '700', flexShrink: 0 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>

                <a href={plan.link} target="_blank" style={{ display: 'block', width: '100%', background: plan.popular ? `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)` : 'rgba(255,255,255,0.04)', border: plan.popular ? 'none' : `1px solid ${plan.border}`, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '14px', padding: '13px', borderRadius: '10px', textDecoration: 'none', textAlign: 'center', cursor: 'pointer', boxShadow: plan.popular ? `0 0 24px ${plan.glow}` : 'none', letterSpacing: '-0.2px' }}>
                  Começar agora →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(37,99,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: '800', fontFamily: 'Syne, sans-serif', letterSpacing: '-1px', marginBottom: '20px', lineHeight: '1.1' }}>
            Pronto para criar seu<br/>
            <span className="shimmer-text">quiz de vendas?</span>
          </h2>
          <p style={{ fontSize: '16px', color: '#4e6a90', marginBottom: '36px', lineHeight: '1.6' }}>
            Mais de 60 segundos você não precisa. A IA faz tudo.
          </p>
          <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '18px', padding: '18px 40px', borderRadius: '14px', textDecoration: 'none', boxShadow: '0 0 60px rgba(37,99,255,0.4)', letterSpacing: '-0.3px' }}>
            ⚡ Criar meu primeiro quiz
          </Link>
          <div style={{ marginTop: '20px', fontSize: '13px', color: '#4e6a90' }}>
            Sem cartão de crédito · Acesso imediato
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #162035', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-1px', fontFamily: 'Syne, sans-serif', marginBottom: '8px' }}>
          Quiz<span style={{ color: '#60a5fa' }}>AI</span>
        </div>
        <div style={{ fontSize: '13px', color: '#4e6a90' }}>
          © 2026 QuizAI · Todos os direitos reservados
        </div>
      </footer>
    </div>
  )
}