import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: quizzes } = await supabase
    .from('quizzes').select('*').eq('user_id', user.id)
    .neq('status', 'archived').order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('users').select('*').eq('id', user.id).single()

  const totalLeads = quizzes?.reduce((a, q) => a + (q.total_leads || 0), 0) ?? 0
  const totalViews = quizzes?.reduce((a, q) => a + (q.total_views || 0), 0) ?? 0
  const totalAtivos = quizzes?.filter(q => q.status === 'active').length ?? 0
  const { data: profile2 } = await supabase
  .from('users').select('ai_quiz_limit, manual_quiz_limit, ai_quizzes_used, manual_quizzes_used').eq('id', user.id).single()

  const aiRestantes = (profile2?.ai_quiz_limit ?? 1) - (profile2?.ai_quizzes_used ?? 0)
  const manualRestantes = (profile2?.manual_quiz_limit ?? 2) - (profile2?.manual_quizzes_used ?? 0)

  const stats = [
    { label: 'Visualizações', value: totalViews.toLocaleString('pt-BR'), color: '#60a5fa', glow: 'rgba(96,165,250,0.15)' },
    { label: 'Leads capturados', value: totalLeads.toLocaleString('pt-BR'), color: '#22c55e', glow: 'rgba(34,197,94,0.15)' },
    { label: 'Quizzes ativos', value: totalAtivos, color: '#a78bfa', glow: 'rgba(167,139,250,0.15)' },
    { label: 'Quizzes IA restantes', value: Math.max(0, aiRestantes), color: '#60a5fa', glow: 'rgba(96,165,250,0.15)' },
    { label: 'Quizzes manuais restantes', value: Math.max(0, manualRestantes), color: '#fbbf24', glow: 'rgba(251,191,36,0.15)' },
  ]

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '26px', fontWeight: '800', margin: '0 0 4px',
          fontFamily: 'Syne, sans-serif', color: '#eef2ff', letterSpacing: '-0.5px',
        }}>
          Olá, {profile?.name?.split(' ')[0] ?? 'produtor'} 👋
        </h1>
        <p style={{ fontSize: '13px', color: '#4e6a90', margin: 0 }}>
          Plano {profile?.plan ?? 'starter'} · {profile?.quiz_limit ?? 1} quiz ativo
        </p>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '32px' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: '#0a1120', border: '1px solid #162035',
            borderRadius: '14px', padding: '20px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-30px', right: '-30px',
              width: '120px', height: '120px',
              background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}/>
            <div style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              {s.label}
            </div>
            <div style={{
              fontSize: '32px', fontWeight: '800', color: s.color,
              fontFamily: 'Syne, sans-serif', lineHeight: 1,
            }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* HEADER QUIZZES */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', margin: 0 }}>
          Meus Quizzes
        </h2>
        <Link href="/dashboard/quizzes/new" style={{
          background: 'linear-gradient(135deg, #2563ff, #1d4ed8)',
          color: '#fff', fontFamily: 'Syne, sans-serif',
          fontWeight: '700', fontSize: '12px',
          padding: '8px 16px', borderRadius: '8px',
          textDecoration: 'none',
          boxShadow: '0 0 16px rgba(37,99,255,0.3)',
        }}>
          + Novo Quiz
        </Link>
      </div>

      {/* EMPTY STATE */}
      {(!quizzes || quizzes.length === 0) && (
        <div style={{
          background: '#0a1120',
          border: '1px dashed #162035',
          borderRadius: '16px', padding: '60px 20px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px', height: '200px',
            background: 'radial-gradient(ellipse, rgba(37,99,255,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}/>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚡</div>
          <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '8px' }}>
            Crie seu primeiro quiz
          </div>
          <p style={{ fontSize: '13px', color: '#4e6a90', marginBottom: '24px' }}>
            Descreva seu produto e a IA monta tudo em 60 segundos
          </p>
          <Link href="/dashboard/quizzes/new" style={{
            background: 'linear-gradient(135deg, #2563ff, #1d4ed8)',
            color: '#fff', fontFamily: 'Syne, sans-serif',
            fontWeight: '700', fontSize: '13px',
            padding: '12px 24px', borderRadius: '10px',
            textDecoration: 'none',
            boxShadow: '0 0 20px rgba(37,99,255,0.3)',
          }}>
            Criar agora →
          </Link>
        </div>
      )}

      {/* LISTA DE QUIZZES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {quizzes?.map(q => (
          <div key={q.id} style={{
            background: '#0a1120', border: '1px solid #162035',
            borderRadius: '12px', padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                background: q.status === 'active' ? '#22c55e' : '#4e6a90',
                boxShadow: q.status === 'active' ? '0 0 8px rgba(34,197,94,0.6)' : 'none',
              }}/>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#eef2ff', marginBottom: '3px' }}>
                  {q.title}
                </div>
                <div style={{ fontSize: '11px', color: '#60a5fa', fontFamily: 'monospace' }}>
                  quizai.app/q/{q.slug}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#4e6a90' }}>{q.total_views} views</div>
                <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: '600' }}>{q.total_leads} leads</div>
              </div>
              <Link href={`/dashboard/quizzes/${q.id}`} style={{
                background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)',
                color: '#60a5fa', fontSize: '11px', fontWeight: '600',
                padding: '6px 14px', borderRadius: '6px', textDecoration: 'none',
              }}>
                Editar →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}