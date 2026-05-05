import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function LeadsPage() {
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
    .from('quizzes')
    .select('id, title, slug')
    .eq('user_id', user.id)
    .neq('status', 'archived')

  const quizIds = quizzes?.map(q => q.id) ?? []

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .in('quiz_id', quizIds.length > 0 ? quizIds : ['none'])
    .order('created_at', { ascending: false })
    .limit(100)

  const getQuizTitle = (id: string) => quizzes?.find(q => q.id === id)?.title ?? '—'

  return (
    <div style={{ padding: '32px', fontFamily: 'DM Sans, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Leads
        </h1>
        <p style={{ fontSize: '13px', color: '#4e6a90', margin: 0 }}>
          {leads?.length ?? 0} leads capturados no total
        </p>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Total de leads', value: leads?.length ?? 0, color: '#60a5fa' },
          { label: 'Completaram o quiz', value: leads?.filter(l => l.completed).length ?? 0, color: '#22c55e' },
          { label: 'Convertidos', value: leads?.filter(l => l.converted).length ?? 0, color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '12px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: `radial-gradient(circle, ${s.color}18 0%, transparent 70%)`, pointerEvents: 'none' }}/>
            <div style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* TABELA */}
      {(!leads || leads.length === 0) ? (
        <div style={{ background: '#0a1120', border: '1px dashed #162035', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>◉</div>
          <div style={{ fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '6px' }}>Nenhum lead ainda</div>
          <p style={{ fontSize: '13px', color: '#4e6a90' }}>Quando alguém preencher seu quiz, os leads aparecem aqui.</p>
        </div>
      ) : (
        <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #162035' }}>
                  {['Nome', 'E-mail', 'WhatsApp', 'Quiz', 'Progresso', 'Status', 'Data'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid rgba(22,32,53,0.5)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#eef2ff', fontWeight: '500' }}>
                      {lead.name || <span style={{ color: '#4e6a90' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4e6a90' }}>
                      {lead.email || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {lead.phone ? (
                        <a href={`https://wa.me/55${lead.phone.replace(/\D/g,'')}`} target="_blank" style={{ fontSize: '12px', color: '#22c55e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          💬 {lead.phone}
                        </a>
                      ) : <span style={{ fontSize: '12px', color: '#4e6a90' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '11px', color: '#60a5fa', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getQuizTitle(lead.quiz_id)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {Array.from({ length: lead.total_steps || 7 }, (_, i) => (
                          <div key={i} style={{ width: '12px', height: '4px', borderRadius: '2px', background: i < lead.step_reached ? '#2563ff' : '#162035' }}/>
                        ))}
                      </div>
                      <div style={{ fontSize: '9px', color: '#4e6a90', marginTop: '2px' }}>
                        {lead.step_reached}/{lead.total_steps || '?'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px',
                        background: lead.converted ? 'rgba(167,139,250,0.1)' : lead.completed ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)',
                        color: lead.converted ? '#a78bfa' : lead.completed ? '#86efac' : '#fca5a5',
                        border: `1px solid ${lead.converted ? 'rgba(167,139,250,0.2)' : lead.completed ? 'rgba(34,197,94,0.2)' : 'rgba(248,113,113,0.2)'}`,
                      }}>
                        {lead.converted ? 'Convertido' : lead.completed ? 'Concluído' : 'Abandonou'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '11px', color: '#4e6a90', whiteSpace: 'nowrap' }}>
                      {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}