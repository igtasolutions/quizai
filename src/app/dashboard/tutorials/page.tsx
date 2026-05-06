import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CATEGORIES = [
  { value: 'primeiros-passos', label: '🚀 Primeiros passos' },
  { value: 'editor', label: '✏️ Editor de blocos' },
  { value: 'conversao', label: '📈 Conversão' },
  { value: 'cobranca', label: '💳 Planos e cobrança' },
]

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return match ? match[1] : null
}

export default async function TutorialsPage() {
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

  const { data: tutorials } = await supabaseAdmin
    .from('tutorials')
    .select('*')
    .eq('published', true)
    .order('order_index', { ascending: true })

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = (tutorials ?? []).filter(t => t.category === cat.value)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Tutoriais
        </h1>
        <p style={{ fontSize: '13px', color: '#4e6a90', margin: 0 }}>
          Aprenda a usar o QuizAI e criar quizzes de alta conversão
        </p>
      </div>

      {CATEGORIES.map(cat => {
        const items = grouped[cat.value] ?? []
        if (items.length === 0) return null
        return (
          <div key={cat.value} style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#eef2ff', fontFamily: 'Syne, sans-serif', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {cat.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map(t => {
                const ytId = t.video_url ? getYouTubeId(t.video_url) : null
                return (
                  <div key={t.id} style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(37,99,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}/>

                    {/* VÍDEO */}
                    {ytId && (
                      <div style={{ position: 'relative', width: '100%', paddingBottom: '40%', background: '#000' }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                          allowFullScreen
                        />
                      </div>
                    )}

                    {/* CONTEÚDO */}
                    <div style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#eef2ff', marginBottom: '4px', fontFamily: 'Syne, sans-serif' }}>
                        {t.title}
                      </div>
                      {t.description && (
                        <div style={{ fontSize: '12px', color: '#4e6a90', lineHeight: '1.5' }}>
                          {t.description}
                        </div>
                      )}
                      {t.video_url && !ytId && (
                        <a href={t.video_url} target="_blank" style={{ display: 'inline-block', marginTop: '10px', background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: '11px', fontWeight: '600', padding: '6px 14px', borderRadius: '7px', textDecoration: 'none' }}>
                          Assistir tutorial →
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {(!tutorials || tutorials.length === 0) && (
        <div style={{ background: '#0a1120', border: '1px dashed #162035', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎓</div>
          <div style={{ fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '6px' }}>Em breve</div>
          <p style={{ fontSize: '13px', color: '#4e6a90' }}>Os tutoriais estão sendo preparados.</p>
        </div>
      )}
    </div>
  )
}