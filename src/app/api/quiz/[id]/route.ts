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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const updates = await req.json()
  const { action } = updates

  // SALVAR — salva apenas no rascunho, não publica
  if (action === 'save') {
    const { blocks, theme, pixel_id, title } = updates
    const { data, error } = await supabase
      .from('quizzes')
      .update({
        blocks_draft: blocks,
        theme_draft: theme,
        ...(pixel_id !== undefined && { pixel_id }),
        ...(title && { title }),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Falha ao salvar' }, { status: 500 })
    return NextResponse.json({ quiz: data, saved: true })
  }

  // PUBLICAR — copia rascunho para produção e ativa
  if (action === 'publish') {
    // Busca o rascunho atual
    const { data: current } = await supabase
      .from('quizzes')
      .select('blocks_draft, theme_draft')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    const { data, error } = await supabase
      .from('quizzes')
      .update({
        blocks: current?.blocks_draft,
        theme: current?.theme_draft,
        status: 'active',
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Falha ao publicar' }, { status: 500 })
    return NextResponse.json({ quiz: data, published: true })
  }

  // DESPUBLICAR
  if (action === 'unpublish') {
    const { data, error } = await supabase
      .from('quizzes')
      .update({ status: 'draft' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Falha ao despublicar' }, { status: 500 })
    return NextResponse.json({ quiz: data, unpublished: true })
  }

  // FALLBACK — atualização genérica (compatibilidade)
  const { action: _, ...rest } = updates
  const { data, error } = await supabase
    .from('quizzes')
    .update(rest)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Falha ao atualizar' }, { status: 500 })
  return NextResponse.json({ quiz: data })
}

export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  await supabase
    .from('quizzes')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}