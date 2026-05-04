import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    await supabase.from('views').insert(body)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Falha' }, { status: 500 })
  }
}