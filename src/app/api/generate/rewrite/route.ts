import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
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
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { block, tone } = await req.json()

    const toneGuide: Record<string, string> = {
      agressivo: 'copy agressivo, urgente, que provoca ação imediata',
      emocional: 'copy emocional, empático, que toca no coração',
      direto: 'copy direto ao ponto, sem rodeios, objetivo',
      vsl: 'copy estilo VSL, narrativo, que conta uma história',
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Reescreva este bloco com ${toneGuide[tone] ?? 'copy de alta conversão'}. Use *palavra* para destacar termos-chave. Retorne APENAS JSON válido no mesmo formato:\n${JSON.stringify(block)}`,
      }],
    })

    const raw = (message.content[0] as { text: string }).text
      .replace(/```json|```/g, '')
      .trim()

    return NextResponse.json({ block: JSON.parse(raw) })
  } catch {
    return NextResponse.json({ error: 'Falha ao reescrever' }, { status: 500 })
  }
}