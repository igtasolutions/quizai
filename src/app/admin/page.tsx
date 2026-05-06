import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminPage() {
  // Stats gerais
  const { count: totalUsers } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true })
  const { count: totalQuizzes } = await supabaseAdmin.from('quizzes').select('*', { count: 'exact', head: true }).neq('status', 'archived')
  const { count: totalLeads } = await supabaseAdmin.from('leads').select('*', { count: 'exact', head: true })

  // Usuários por plano
  const { data: planData } = await supabaseAdmin.from('users').select('plan')
  const planCount = (planData ?? []).reduce((acc: any, u: any) => {
    acc[u.plan] = (acc[u.plan] ?? 0) + 1
    return acc
  }, {})

  // MRR estimado
  const prices: Record<string, number> = { starter: 37, pro: 67, business: 97, agency: 197 }
  const mrr = Object.entries(planCount).reduce((acc, [plan, count]) => acc + (prices[plan] ?? 0) * (count as number), 0)

  // Cadastros recentes
  const { data: recentUsers } = await supabaseAdmin
    .from('users')
    .select('id, name, email, plan, created_at, ai_quizzes_used, manual_quizzes_used')
    .order('created_at', { ascending: false })
    .limit(10)

  const stats = [
    { label: 'Usuários', value: totalUsers ?? 0, color: '#60a5fa', glow: 'rgba(96,165,250,0.15)' },
    { label: 'Quizzes ativos', value: totalQuizzes ?? 0, color: '#22c55e', glow: 'rgba(34,197,94,0.15)' },
    { label: 'Total de leads', value: totalLeads ?? 0, color: '#a78bfa', glow: 'rgba(167,139,250,0.15)' },
    { label: 'MRR estimado', value: `R$${mrr.toLocaleString('pt-BR')}`, color: '#fbbf24', glow: 'rgba(251,191,36,0.15)' },
    { label: 'Starter', value: planCount['starter'] ?? 0, color: '#60a5fa', glow: 'rgba(96,165,250,0.1)' },
    { label: 'Pro', value: planCount['pro'] ?? 0, color: '#a78bfa', glow: 'rgba(167,139,250,0.1)' },
    { label: 'Business', value: planCount['business'] ?? 0, color: '#34d399', glow: 'rgba(52,211,153,0.1)' },
    { label: 'Agency', value: planCount['agency'] ?? 0, color: '#fbbf24', glow: 'rgba(251,191,36,0.1)' },
  ]

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Admin Overview
        </h1>
        <p style={{ fontSize: '13px', color: '#4e6a90', margin: 0 }}>Visão geral do QuizAI</p>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '12px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`, pointerEvents: 'none' }}/>
            <div style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* CADASTROS RECENTES */}
      <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #162035', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#eef2ff' }}>Cadastros recentes</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #162035' }}>
                {['Nome', 'E-mail', 'Plano', 'IA usada', 'Manual usado', 'Cadastro'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentUsers ?? []).map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(22,32,53,0.5)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#eef2ff', fontWeight: '500' }}>{u.name || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4e6a90' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', background: u.plan === 'agency' ? 'rgba(251,191,36,0.1)' : u.plan === 'business' ? 'rgba(52,211,153,0.1)' : u.plan === 'pro' ? 'rgba(167,139,250,0.1)' : 'rgba(96,165,250,0.1)', color: u.plan === 'agency' ? '#fbbf24' : u.plan === 'business' ? '#34d399' : u.plan === 'pro' ? '#a78bfa' : '#60a5fa', border: `1px solid ${u.plan === 'agency' ? 'rgba(251,191,36,0.2)' : u.plan === 'business' ? 'rgba(52,211,153,0.2)' : u.plan === 'pro' ? 'rgba(167,139,250,0.2)' : 'rgba(96,165,250,0.2)'}`, textTransform: 'capitalize' }}>
                      {u.plan}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#60a5fa', textAlign: 'center' }}>{u.ai_quizzes_used ?? 0}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#fbbf24', textAlign: 'center' }}>{u.manual_quizzes_used ?? 0}</td>
                  <td style={{ padding: '12px 16px', fontSize: '11px', color: '#4e6a90', whiteSpace: 'nowrap' }}>
                    {new Date(u.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}