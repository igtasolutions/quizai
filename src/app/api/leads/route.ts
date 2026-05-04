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