import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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
    .from('quizzes')
    .select('*')
    .eq('user_id', user.id)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const totalLeads = quizzes?.reduce((a, q) => a + (q.total_leads || 0), 0) ?? 0
  const totalViews = quizzes?.reduce((a, q) => a + (q.total_views || 0), 0) ?? 0

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          Olá, {profile?.name?.split(' ')[0] ?? 'produtor'} 👋
        </h1>
        <p className="text-sm text-[#4e6a90]">
          Plano {profile?.plan ?? 'starter'} · {profile?.quiz_limit ?? 1} quiz ativo
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Visualizações', value: totalViews.toLocaleString('pt-BR'), color: 'text-blue-400' },
          { label: 'Leads capturados', value: totalLeads.toLocaleString('pt-BR'), color: 'text-green-400' },
          { label: 'Quizzes ativos', value: quizzes?.filter(q => q.status === 'active').length ?? 0, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0a1120] border border-[#162035] rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-wider text-[#4e6a90] mb-2">{s.label}</div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">Meus Quizzes</h2>
        <a href="/dashboard/quizzes/new" className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Novo Quiz
        </a>
      </div>

      {(!quizzes || quizzes.length === 0) && (
        <div className="bg-[#0a1120] border border-dashed border-[#162035] rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">⚡</div>
          <div className="font-bold mb-2">Crie seu primeiro quiz</div>
          <p className="text-sm text-[#4e6a90] mb-4">Descreva seu produto e a IA monta tudo em 60 segundos</p>
          <a href="/dashboard/quizzes/new" className="bg-blue-600 text-white text-sm font-bold px-6 py-3 rounded-xl inline-block hover:bg-blue-700 transition-colors">
            Criar agora →
          </a>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {quizzes?.map(q => (
          <div key={q.id} className="bg-[#0a1120] border border-[#162035] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${q.status === 'active' ? 'bg-green-400' : 'bg-[#4e6a90]'}`} />
              <div>
                <div className="font-medium text-sm">{q.title}</div>
                <div className="text-[11px] text-blue-400 font-mono">quizai.app/q/{q.slug}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[#4e6a90]">
              <span>{q.total_views} views</span>
              <span className="text-green-400">{q.total_leads} leads</span>
              <a href={`/dashboard/quizzes/${q.id}`} className="text-blue-400 font-medium">Editar →</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}