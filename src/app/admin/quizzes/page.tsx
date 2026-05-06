import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminQuizzesPage() {
  const { data: quizzes } = await supabaseAdmin
    .from('quizzes')
    .select('id, title, slug, status, total_views, total_leads, created_at, user_id')
    .neq('status', 'archived')
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, name, email')

  const getUserName = (uid: string) => {
    const u = users?.find(u => u.id === uid)
    return u?.name || u?.email || '—'
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Quizzes
        </h1>
        <p style={{ fontSize: '13px', color: '#4e6a90', margin: 0 }}>
          {quizzes?.length ?? 0} quizzes ativos
        </p>
      </div>

      <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #162035' }}>
                {['Quiz', 'Produtor', 'Status', 'Views', 'Leads', 'Criado', 'Link'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(quizzes ?? []).map(q => (
                <tr key={q.id} style={{ borderBottom: '1px solid rgba(22,32,53,0.5)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '13px', color: '#eef2ff', fontWeight: '500', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.title}</div>
                    <div style={{ fontSize: '10px', color: '#4e6a90', fontFamily: 'monospace' }}>/q/{q.slug}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4e6a90' }}>
                    {getUserName(q.user_id)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: q.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(100,100,100,0.1)', color: q.status === 'active' ? '#22c55e' : '#4e6a90', border: `1px solid ${q.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(100,100,100,0.2)'}` }}>
                      {q.status === 'active' ? 'Ativo' : 'Rascunho'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#60a5fa', textAlign: 'center' as const }}>{q.total_views ?? 0}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#22c55e', textAlign: 'center' as const }}>{q.total_leads ?? 0}</td>
                  <td style={{ padding: '12px 16px', fontSize: '11px', color: '#4e6a90', whiteSpace: 'nowrap' as const }}>
                    {new Date(q.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <a href={`/q/${q.slug}`} target="_blank" style={{ background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: '10px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px', textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
                      Ver →
                    </a>
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