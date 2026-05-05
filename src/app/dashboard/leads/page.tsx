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
    .select('quiz_id, step_reached, total_steps, completed, converted, created_at, video_seconds_watched')
    .in('quiz_id', quizzes?.map(q => q.id) ?? ['none'])

  const totalLeads = allLeads?.length ?? 0
  const totalCompleted = allLeads?.filter(l => l.completed).length ?? 0
  const totalConverted = allLeads?.filter(l => l.converted).length ?? 0

  const typeColor: Record<string, string> = {
    headline: '#a78bfa', question: '#60a5fa', insight: '#fde047',
    capture: '#f9a8d4', offer: '#fdba74', bridge: '#5eead4',
    social_proof: '#86efac', manual: '#fbbf24', video: '#fca5a5', rich: '#6ee7b7',
  }

  const quizFunnels = quizzes?.map(quiz => {
    const leads = allLeads?.filter(l => l.quiz_id === quiz.id) ?? []
    const blocks = (quiz.blocks as any[]) ?? []

    const steps = blocks.map((b: any, i: number) => ({
      step: i + 1,
      label: b?.label ?? `Etapa ${i + 1}`,
      title: (b?.title ?? '').replace(/\*([^*]+)\*/g, '$1').substring(0, 40),
      type: b?.type ?? 'question',
      blockId: b?.id ?? '',
      videoDuration: b?.videoDuration ?? 0,
      videoPitchSecond: b?.videoPitchSecond ?? 0,
      count: leads.filter(l => l.step_reached > i).length,
    }))

    // Analytics de vídeo por bloco
    const videoAnalytics = steps
      .filter(s => s.type === 'video' && s.videoDuration > 0)
      .map(s => {
        const videoLeads = leads.filter(l => {
          const watched = l.video_seconds_watched as Record<string, number> | null
          return watched && watched[s.blockId] !== undefined
        })

        const avgSeconds = videoLeads.length > 0
          ? Math.round(videoLeads.reduce((acc, l) => {
              const watched = l.video_seconds_watched as Record<string, number>
              return acc + (watched[s.blockId] ?? 0)
            }, 0) / videoLeads.length)
          : 0

        const reachedPitch = s.videoPitchSecond > 0
          ? videoLeads.filter(l => {
              const watched = l.video_seconds_watched as Record<string, number>
              return (watched[s.blockId] ?? 0) >= s.videoPitchSecond
            }).length
          : 0

        const pitchRate = videoLeads.length > 0 && s.videoPitchSecond > 0
          ? Math.round((reachedPitch / videoLeads.length) * 100)
          : 0

        // Distribuição por faixas de tempo (para curva de retenção)
        const segments = 10
        const segmentSize = Math.ceil(s.videoDuration / segments)
        const retention = Array.from({ length: segments }, (_, si) => {
          const threshold = (si + 1) * segmentSize
          const count = videoLeads.filter(l => {
            const watched = l.video_seconds_watched as Record<string, number>
            return (watched[s.blockId] ?? 0) >= threshold
          }).length
          return {
            label: `${Math.floor(threshold / 60)}min`,
            pct: videoLeads.length > 0 ? Math.round((count / videoLeads.length) * 100) : 0,
            count,
          }
        })

        return {
          stepLabel: s.label,
          stepTitle: s.title,
          duration: s.videoDuration,
          pitchSecond: s.videoPitchSecond,
          totalWatchers: videoLeads.length,
          avgSeconds,
          avgPct: s.videoDuration > 0 ? Math.round((avgSeconds / s.videoDuration) * 100) : 0,
          reachedPitch,
          pitchRate,
          retention,
        }
      })

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
      videoAnalytics,
    }
  }) ?? []

  return (
    <div style={{ padding: '32px', fontFamily: 'DM Sans, sans-serif', maxWidth: '900px', margin: '0 auto' }}>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Analytics de Leads</h1>
        <p style={{ fontSize: '13px', color: '#4e6a90', margin: 0 }}>Funil por etapa + retenção de vídeo</p>
      </div>

      {/* STATS GERAIS */}
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

      {quizFunnels.map(quiz => (
        <div key={quiz.id} style={{ marginBottom: '20px' }}>

          {/* FUNIL */}
          <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '16px', padding: '24px', marginBottom: '12px', position: 'relative', overflow: 'hidden' }}>
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
                    <div style={{ fontSize: '9px', color: '#4e6a90', textTransform: 'uppercase' }}>{s.label}</div>
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
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color, flexShrink: 0 }}>{step.step}</div>
                        <div style={{ fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: `${color}15`, color, border: `1px solid ${color}30`, flexShrink: 0, textTransform: 'uppercase' as const }}>{step.type}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '9px', color: '#4e6a90', textTransform: 'uppercase' as const }}>{step.label}</div>
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
                        {idx > 0 && dropPct > 0 && <div style={{ fontSize: '9px', color: dropPct > 30 ? '#f87171' : '#4e6a90', fontWeight: '600', flexShrink: 0 }}>↓ {dropPct}%</div>}
                        {isWorst && quiz.totalLeads > 0 && <div style={{ fontSize: '8px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', padding: '1px 6px', borderRadius: '4px', flexShrink: 0 }}>maior saída</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ANALYTICS DE VÍDEO */}
          {quiz.videoAnalytics.map((va, i) => (
            <div key={i} style={{ background: '#0a1120', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '12px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}/>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '5px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)', textTransform: 'uppercase' as const }}>vídeo</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#eef2ff' }}>{va.stepLabel}</div>
                  <div style={{ fontSize: '11px', color: '#4e6a90' }}>{va.stepTitle}</div>
                </div>
              </div>

              {/* STATS DO VÍDEO */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Assistiram', value: va.totalWatchers, color: '#60a5fa' },
                  { label: 'Tempo médio', value: `${Math.floor(va.avgSeconds / 60)}min ${va.avgSeconds % 60}s`, color: '#fbbf24' },
                  { label: '% médio assistido', value: `${va.avgPct}%`, color: '#a78bfa' },
                  { label: 'Chegaram ao pitch', value: va.videoPitchSecond > 0 ? `${va.pitchRate}%` : '—', color: '#22c55e' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #162035', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '9px', color: '#4e6a90', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '6px' }}>{s.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* CURVA DE RETENÇÃO */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#eef2ff', marginBottom: '12px' }}>📈 Curva de retenção</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px', marginBottom: '6px' }}>
                  {va.retention.map((seg, si) => (
                    <div key={si} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '4px' }}>
                      <div style={{ fontSize: '8px', color: '#4e6a90' }}>{seg.pct}%</div>
                      <div style={{
                        width: '100%',
                        height: `${Math.max(seg.pct, 2)}%`,
                        background: seg.pct > 60 ? 'rgba(34,197,94,0.6)' : seg.pct > 30 ? 'rgba(251,191,36,0.6)' : 'rgba(248,113,113,0.6)',
                        borderRadius: '3px 3px 0 0',
                        minHeight: '4px',
                        position: 'relative' as const,
                      }}>
                        {/* Linha do pitch */}
                        {va.pitchSecond > 0 && Math.round(si * va.duration / 10) <= va.pitchSecond && Math.round((si + 1) * va.duration / 10) > va.pitchSecond && (
                          <div style={{ position: 'absolute' as const, top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '8px', color: '#fbbf24', whiteSpace: 'nowrap' as const }}>🎯 pitch</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {va.retention.map((seg, si) => (
                    <div key={si} style={{ flex: 1, textAlign: 'center' as const, fontSize: '8px', color: '#4e6a90' }}>{seg.label}</div>
                  ))}
                </div>
              </div>

              {va.pitchSecond > 0 && (
                <div style={{ marginTop: '14px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '12px', color: '#4e6a90' }}>
                    🎯 Pitch em <span style={{ color: '#fbbf24', fontWeight: '600' }}>{Math.floor(va.pitchSecond / 60)}min {va.pitchSecond % 60}s</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#22c55e' }}>
                    {va.reachedPitch} leads viram o pitch ({va.pitchRate}%)
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}