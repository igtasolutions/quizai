import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { action, blocks, theme, title } = body

  if (action === 'save') {
    const { error } = await supabase
      .from('pages')
      .update({ blocks_draft: blocks, theme_draft: theme ?? null, title: title ?? undefined, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return NextResponse.json({ error: 'Falha ao salvar' }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'publish') {
    const { data: page } = await supabase.from('pages').select('blocks_draft, theme_draft').eq('id', id).single()
    const { error } = await supabase
      .from('pages')
      .update({ blocks: page?.blocks_draft, theme: page?.theme_draft, status: 'active', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return NextResponse.json({ error: 'Falha ao publicar' }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'unpublish') {
    const { error } = await supabase
      .from('pages')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return NextResponse.json({ error: 'Falha ao despublicar' }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  await supabase.from('pages').update({ status: 'archived' }).eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}