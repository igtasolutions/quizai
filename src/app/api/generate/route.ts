import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // Verifica limite de IA
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('ai_quiz_limit, ai_quizzes_used, plan')
      .eq('id', user.id)
      .single()

    const aiUsed = profile?.ai_quizzes_used ?? 0
    const aiLimit = profile?.ai_quiz_limit ?? 1

    if (aiUsed >= aiLimit) {
      return NextResponse.json({
        error: `Limite de quizzes com IA atingido (${aiUsed}/${aiLimit}). Faça upgrade do seu plano para criar mais quizzes com IA.`
      }, { status: 403 })
    }

    const body = await req.json()
    const { product, config } = body

    const ativos = config.blocos_ativos.join(', ')
    const nEtapas: Record<string, string> = {
      auto: 'entre 8 e 12 blocos',
      short: '5 a 7',
      mid: '8 a 10',
      full: '11 a 14',
    }

    const prompt = `Você é expert em quiz de vendas de alta conversão para o mercado brasileiro de infoprodutos.

Crie um quiz de vendas completo para:
- Produto: ${product.nome}
- Nicho: ${product.nicho}
- Preço: R$ ${product.preco}
- Promessa: ${product.promessa}
- Dores: ${product.dores}
- Benefícios: ${product.beneficios}
- Público: ${product.publico}
${product.url_referencia ? `- Referência: ${product.url_referencia}` : ''}

Blocos a incluir: ${ativos}
Quantidade de etapas: ${nEtapas[config.etapas] ?? 'ideal'} (máximo absoluto de 14 blocos)

REGRAS DO COPY:
- Português brasileiro coloquial, direto e emocional
- Use *palavra* para destacar termos-chave em azul
- Números específicos sempre que possível
- Cada title deve criar urgência ou curiosidade

Retorne APENAS JSON válido:
{"blocks":[{"id":"b1","type":"headline","label":"CAPTURA EMOCIONAL","title":"headline com número específico","subtitle":"subtítulo que reforça a promessa","options":[]}]}

Tipos: headline, question, insight, social_proof, capture, offer, bridge`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (message.content[0] as { text: string }).text
      .replace(/```json|```/g, '')
      .trim()

    const parsed = JSON.parse(raw)

    // Incrementa contador de IA usado
    await supabaseAdmin
      .from('users')
      .update({ ai_quizzes_used: aiUsed + 1 })
      .eq('id', user.id)

    return NextResponse.json({ blocks: parsed.blocks })
  } catch (error) {
    console.error('Erro ao gerar quiz:', error)
    return NextResponse.json({ error: 'Falha ao gerar quiz' }, { status: 500 })
  }
}