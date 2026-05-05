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
    .select('id, title, slug, total_views, total_leads, total_clicks, blocks')
    .eq('user_id', user.id)
    .neq('status', 'archived')

  const { data: allLeads } = await supabase
    .from('leads')
    .select('quiz_id, step_reached, total_steps, completed, converted, created_at')
    .in('quiz_id', quizzes?.map(q => q.id) ?? ['none'])

  const totalLeads = allLeads?.length ?? 0
  const totalCompleted = allLeads?.filter(l => l.completed).length ?? 0
  const totalConverted = allLeads?.filter(l => l.converted).length ?? 0

  const typeColor: Record<string, string> = {
    headline: '#a78bfa', question: '#60a5fa', insight: '#fde047',
    capture: '#f9a8d4', offer: '#fdba74', bridge: '#5eead4',
    social_proof: '#86efac', manual: '#fbbf24', video: '#fca5a5',
  }

  const quizFunnels = quizzes?.map(quiz => {
    const leads = allLeads?.filter(l => l.quiz_id === quiz.id) ?? []
    const blocks = (quiz.blocks as any[]) ?? []

    const steps = blocks.map((b: any, i: number) => ({
      step: i + 1,
      label: b?.label ?? `Etapa ${i + 1}`,
      title: (b?.title ?? '').replace(/\*([^*]+)\*/g, '$1').substring(0, 40),
      type: b?.type ?? 'question',
      count: leads.filter(l => l.step_reached > i).length,
    }))

    return {
      id: quiz.id,
      title: quiz.title,
      slug: quiz.slug,
      totalLeads: leads.length,
      completed: leads.filter(l => l.completed).length,
      converted: leads.filter(l => l.converted).length,
      views: quiz.total_views,
      steps,
      maxCount: leads.length || 1,
    }
  }) ?? []

  return (
    <div style={{ padding: '32px', fontFamily: 'DM Sans, sans-serif', maxWidth: '900px', margin: '0 auto' }}>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Analytics de Leads
        </h1>
        <p style={{ fontSize: '13px', color: '#4e6a90', margin: 0 }}>
          Funil por etapa — veja onde os leads estão saindo
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Total de leads', value: totalLeads, color: '#60a5fa' },
          { label: 'Completaram', value: totalCompleted, color: '#22c55e' },
          { label: 'Convertidos', value: totalConverted, color: '#a78bfa' },
          { label: 'Taxa conclusão', value: totalLeads > 0 ? `${Math.round((totalCompleted / totalLeads) * 100)}%` : '0%', color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '12px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: `radial-gradient(circle, ${s.color}15 0%, transparent 70%)`, pointerEvents: 'none' }}/>
            <div style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {quizFunnels.length === 0 ? (
        <div style={{ background: '#0a1120', border: '1px dashed #162035', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>◈</div>
          <div style={{ fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '6px' }}>Nenhum quiz ainda</div>
          <p style={{ fontSize: '13px', color: '#4e6a90' }}>Crie seu primeiro quiz para ver o funil aqui.</p>
        </div>
      ) : (
        quizFunnels.map(quiz => (
          <div key={quiz.id} style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '16px', padding: '24px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(37,99,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}/>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '4px' }}>{quiz.title}</div>
                <div style={{ fontSize: '11px', color: '#60a5fa', fontFamily: 'monospace' }}>quizai.app/q/{quiz.slug}</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { label: 'Views', value: quiz.views, color: '#60a5fa' },
                  { label: 'Leads', value: quiz.totalLeads, color: '#22c55e' },
                  { label: 'Convertidos', value: quiz.converted, color: '#a78bfa' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid #162035', borderRadius: '8px', padding: '8px 12px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '9px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {quiz.totalLeads === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#4e6a90', fontSize: '13px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                Nenhum lead ainda neste quiz
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {quiz.steps.map((step, idx) => {
                  const pct = Math.round((step.count / quiz.maxCount) * 100)
                  const prevCount = idx > 0 ? quiz.steps[idx - 1].count : quiz.maxCount
                  const dropPct = prevCount > 0 ? Math.round(((prevCount - step.count) / prevCount) * 100) : 0
                  const color = typeColor[step.type] ?? '#60a5fa'
                  const isWorst = step.count === Math.min(...quiz.steps.map((s: any) => s.count))

                  return (
                    <div key={step.step}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color, flexShrink: 0 }}>
                          {step.step}
                        </div>
                        <div style={{ fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: `${color}15`, color, border: `1px solid ${color}30`, flexShrink: 0, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
                          {step.type}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '9px', color: '#4e6a90', textTransform: 'uppercase' as const, letterSpacing: '0.3px' }}>{step.label}</div>
                          <div style={{ fontSize: '11px', color: '#eef2ff', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{step.title}</div>
                        </div>
                        <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#eef2ff' }}>{step.count}</div>
                          <div style={{ fontSize: '10px', color: pct > 60 ? '#22c55e' : pct > 30 ? '#fbbf24' : '#f87171', fontWeight: '600' }}>{pct}%</div>
                        </div>
                      </div>
                      <div style={{ marginLeft: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})`, borderRadius: '3px' }}/>
                        </div>
                        {idx > 0 && dropPct > 0 && (
                          <div style={{ fontSize: '9px', color: dropPct > 30 ? '#f87171' : '#4e6a90', fontWeight: '600', flexShrink: 0 }}>
                            ↓ {dropPct}%
                          </div>
                        )}
                        {isWorst && quiz.totalLeads > 0 && (
                          <div style={{ fontSize: '8px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', padding: '1px 6px', borderRadius: '4px', flexShrink: 0 }}>
                            maior saída
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}