import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'

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
  const { title, product, blocks, config, video, pixel_id } = body

  const { data: slugData } = await supabase
    .rpc('generate_slug', { title })
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

  if (error) {
    if (error.message.includes('Limite')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Falha ao criar quiz' }, { status: 500 })
  }

  return NextResponse.json({ quiz: data })
}