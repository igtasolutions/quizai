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

    const prompt = `Você é o melhor especialista em quiz de vendas de alta conversão do Brasil. Seu trabalho é criar quizzes que geram diagnósticos personalizados e vendem infoprodutos de forma natural e persuasiva.

PRODUTO:
- Nome: ${product.nome}
- Nicho: ${product.nicho}
- Preço: R$ ${product.preco}
- Promessa principal: ${product.promessa}
- Dores do público: ${product.dores}
- Benefícios: ${product.beneficios}
- Público-alvo: ${product.publico}
- Checkout: ${product.checkout_url || 'não informado'}
${product.url_referencia ? `- Referência de quiz: ${product.url_referencia}` : ''}

ESTRUTURA OBRIGATÓRIA DO QUIZ:
Blocos a incluir: ${ativos}
Quantidade: ${nEtapas[config.etapas] ?? 'entre 8 e 12 blocos'} (NUNCA ultrapasse 14 blocos)

REGRAS DE COPY OBRIGATÓRIAS:
1. Português brasileiro coloquial, direto e emocional — fale como um amigo que entende do assunto
2. Use *palavra* para destacar termos-chave (máx 2-3 por título)
3. Números ESPECÍFICOS e reais — nunca genéricos. Ex: "87% das pessoas" não "muitas pessoas"
4. Títulos com gatilhos: curiosidade, dor, urgência, identificação
5. Cada pergunta deve fazer o lead se identificar e avançar
6. O quiz deve parecer um DIAGNÓSTICO PERSONALIZADO, não uma pesquisa
7. Use linguagem do nicho — termos que o público usa no dia a dia
8. Subtítulos complementam o título com contexto ou prova social
9. O bloco de oferta deve ter stack de valor completo com lista de benefícios

TIPOS DE BLOCO E COMO USAR:
- headline: Abertura impactante que faz o lead se identificar imediatamente. Deve prometer o diagnóstico.
- question: Pergunta de múltipla escolha com 3-4 opções. Opções devem ser situações reais que o público vive.
- insight: Revelação de dado chocante ou verdade inconveniente sobre o nicho. Sem opções.
- bridge: Transição psicológica entre diagnóstico e solução. Cria antecipação.
- social_proof: Depoimento específico com nome, resultado e tempo. Ex: "Maria ganhou R$3.847 em 23 dias"
- capture: Formulário de captura. Título deve prometer entregar o diagnóstico personalizado.
- offer: Oferta final com todos os benefícios listados no subtitle, preço, garantia e urgência.

DIFERENCIAL OBRIGATÓRIO:
- Perguntas devem ter progressão lógica — cada resposta aprofunda o diagnóstico
- Use a matemática da dor: mostre quanto o lead está perdendo por não agir
- O bloco de insight deve usar dado específico do nicho: ${product.nicho}
- A oferta deve mencionar o preço R$ ${product.preco} e criar urgência real
- Crie personalidade no quiz — ele deve ter uma voz única, não genérica

FORMATO JSON — Retorne APENAS o JSON, sem texto antes ou depois:
{"blocks":[
  {"id":"b1","type":"headline","label":"CAPTURA EMOCIONAL","title":"Título com *destaque* e número específico","subtitle":"Subtítulo que reforça com contexto e prova","options":[]},
  {"id":"b2","type":"question","label":"DIAGNÓSTICO 1","title":"Pergunta que faz o lead se identificar?","subtitle":"Contexto opcional da pergunta","options":["Opção A específica e real","Opção B específica e real","Opção C específica e real"]},
  {"id":"b3","type":"insight","label":"REVELAÇÃO","title":"*87%* das pessoas no seu nicho cometem esse erro","subtitle":"Dado específico que choca e gera curiosidade","options":[]}
]}`

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