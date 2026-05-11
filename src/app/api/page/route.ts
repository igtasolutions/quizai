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

export async function GET() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data } = await supabase
    .from('pages')
    .select('*')
    .eq('user_id', user.id)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  return NextResponse.json({ pages: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { title, blocks, is_ai_generated, product } = body

  const slug = `page-${nanoid(8)}`

  const { data, error } = await supabase
    .from('pages')
    .insert({
      user_id: user.id,
      title,
      slug,
      status: 'draft',
      blocks: blocks ?? [],
      blocks_draft: blocks ?? [],
      product: product ?? {},
      is_ai_generated: is_ai_generated ?? false,
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar página:', error)
    return NextResponse.json({ error: 'Falha ao criar página: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ page: data })
}