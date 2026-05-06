import { createClient } from '@supabase/supabase-js'
import AdminUserActions from './AdminUserActions'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLAN_LIMITS: Record<string, { total: number; ai: number; manual: number }> = {
  starter:  { total: 3,  ai: 1,  manual: 2 },
  pro:      { total: 5,  ai: 3,  manual: 2 },
  business: { total: 10, ai: 10, manual: 0 },
  agency:   { total: 50, ai: 35, manual: 15 },
}

export default async function AdminUsersPage() {
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Usuários
        </h1>
        <p style={{ fontSize: '13px', color: '#4e6a90', margin: 0 }}>
          {users?.length ?? 0} usuários cadastrados
        </p>
      </div>

      <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #162035' }}>
                {['Usuário', 'Plano', 'IA', 'Manual', 'Quizzes', 'Cadastro', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map(u => {
                const limits = PLAN_LIMITS[u.plan ?? 'starter'] ?? PLAN_LIMITS.starter
                const aiUsed = u.ai_quizzes_used ?? 0
                const manualUsed = u.manual_quizzes_used ?? 0
                const aiLimit = u.ai_quiz_limit ?? limits.ai
                const manualLimit = u.manual_quiz_limit ?? limits.manual

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(22,32,53,0.5)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '13px', color: '#eef2ff', fontWeight: '500' }}>{u.name || '—'}</div>
                      <div style={{ fontSize: '11px', color: '#4e6a90' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', background: u.plan === 'agency' ? 'rgba(251,191,36,0.1)' : u.plan === 'business' ? 'rgba(52,211,153,0.1)' : u.plan === 'pro' ? 'rgba(167,139,250,0.1)' : 'rgba(96,165,250,0.1)', color: u.plan === 'agency' ? '#fbbf24' : u.plan === 'business' ? '#34d399' : u.plan === 'pro' ? '#a78bfa' : '#60a5fa', border: `1px solid ${u.plan === 'agency' ? 'rgba(251,191,36,0.2)' : 'rgba(96,165,250,0.2)'}`, textTransform: 'capitalize' as const }}>
                        {u.plan ?? 'starter'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#eef2ff' }}>
                      <span style={{ color: aiUsed >= aiLimit ? '#f87171' : '#22c55e' }}>{aiUsed}</span>
                      <span style={{ color: '#4e6a90' }}>/{aiLimit}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#eef2ff' }}>
                      <span style={{ color: manualUsed >= manualLimit ? '#f87171' : '#fbbf24' }}>{manualUsed}</span>
                      <span style={{ color: '#4e6a90' }}>/{manualLimit}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4e6a90', textAlign: 'center' as const }}>
                      {u.quiz_limit ?? limits.total}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '11px', color: '#4e6a90', whiteSpace: 'nowrap' as const }}>
                      {new Date(u.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <AdminUserActions user={u} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}