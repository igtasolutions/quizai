import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
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
}

const PLAN_LIMITS: Record<string, { total: number; ai: number; manual: number }> = {
  starter:  { total: 3,  ai: 1,  manual: 2 },
  pro:      { total: 5,  ai: 3,  manual: 2 },
  business: { total: 10, ai: 10, manual: 0 },
  agency:   { total: 50, ai: 35, manual: 15 },
}

export async function GET() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data } = await supabase
    .from('quizzes')
    .select('*')
    .eq('user_id', user.id)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  return NextResponse.json({ quizzes: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { title, product, blocks, config, video, pixel_id, is_ai_generated } = body

  // Busca perfil com limites
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('plan, ai_quiz_limit, manual_quiz_limit, ai_quizzes_used, manual_quizzes_used')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan ?? 'starter'
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.starter

  // Conta quizzes ativos
  const { count: totalAtivos } = await supabaseAdmin
    .from('quizzes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .neq('status', 'archived')

  // Verifica limite total
  if ((totalAtivos ?? 0) >= limits.total) {
    return NextResponse.json({
      error: `Limite de ${limits.total} quizzes atingido no plano ${plan}. Faça upgrade para criar mais.`
    }, { status: 403 })
  }

  // Verifica limite manual (se não for IA)
  if (!is_ai_generated) {
    const manualUsed = profile?.manual_quizzes_used ?? 0
    const manualLimit = profile?.manual_quiz_limit ?? limits.manual
    if (manualUsed >= manualLimit) {
      return NextResponse.json({
        error: `Limite de ${manualLimit} quizzes manuais atingido. Faça upgrade ou use créditos de IA.`
      }, { status: 403 })
    }
    // Incrementa contador manual
    await supabaseAdmin
      .from('users')
      .update({ manual_quizzes_used: manualUsed + 1 })
      .eq('id', user.id)
  }

  const { data: slugData } = await supabase.rpc('generate_slug', { title })
  const slug = slugData || `quiz-${nanoid(6)}`

  const { data, error } = await supabase
    .from('quizzes')
    .insert({
      user_id: user.id,
      title,
      slug,
      status: 'draft',
      product,
      blocks,
      video: video ?? null,
      pixel_id: pixel_id ?? null,
      settings: {
        capture_fields: config?.capture_fields ?? ['name', 'email', 'phone'],
        show_progress: true,
        watermark: true,
      },
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Falha ao criar quiz' }, { status: 500 })

  return NextResponse.json({ quiz: data })
}