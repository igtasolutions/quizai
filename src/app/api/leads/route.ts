import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      quiz_id, user_id, name, email, phone,
      answers, step_reached, total_steps,
      session_id, utm_source, utm_medium, utm_campaign,
      referrer, device_type, country,
    } = body

    const { data, error } = await supabase
      .from('leads')
      .insert({
        quiz_id, user_id, name, email, phone,
        answers: answers ?? [],
        step_reached, total_steps,
        completed: step_reached >= total_steps,
        session_id,
        utm_source, utm_medium, utm_campaign,
        referrer, device_type, country,
      })
      .select()
      .single()

    if (error) throw error

    await supabase.from('views').insert({
      quiz_id,
      lead_id: data.id,
      session_id,
      event_type: 'lead_capture',
      device_type,
      country,
    })

    return NextResponse.json({ lead: data })
  } catch (error) {
    console.error('Erro ao salvar lead:', error)
    return NextResponse.json({ error: 'Falha ao salvar lead' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { lead_id, video_seconds_watched } = body

    if (!lead_id) return NextResponse.json({ error: 'lead_id obrigatório' }, { status: 400 })

    const { error } = await supabase
      .from('leads')
      .update({ video_seconds_watched })
      .eq('id', lead_id)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro ao atualizar lead:', error)
    return NextResponse.json({ error: 'Falha ao atualizar lead' }, { status: 500 })
  }
}