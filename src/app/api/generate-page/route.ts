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

    const body = await req.json()
    const { product, sections } = body

    const prompt = `Você é um especialista em copywriting de alta conversão para o mercado digital brasileiro.

Crie uma landing page completa para o seguinte produto/serviço:

Produto: ${product.nome}
Nicho: ${product.nicho}
Promessa principal: ${product.promessa}
Dores do público: ${product.dores}
Benefícios: ${product.beneficios}
Público-alvo: ${product.publico}
Preço: ${product.preco || 'não informado'}
URL de checkout: ${product.checkout_url || ''}

Seções solicitadas: ${sections.join(', ')}

Retorne APENAS um JSON válido (sem markdown, sem explicações) com o seguinte formato:
{
  "blocks": [
    {
      "id": "block-1",
      "type": "rich",
      "label": "HEADLINE",
      "title": "Título principal da página",
      "subtitle": "Subtítulo persuasivo",
      "options": [],
      "sections": [],
      "titleBold": true
    }
  ]
}

Tipos de blocos disponíveis:
- "rich": bloco de texto/conteúdo rico com title e subtitle
- "insight": destaque/alerta com title e subtitle
- "bridge": transição/loading com title e subtitle
- "social_proof": depoimento com title, testimonialName, testimonialRole, testimonialText, testimonialStars (1-5)
- "offer": oferta/CTA com title, subtitle, buttonText, buttonUrl
- "video": vídeo com title, subtitle, videoProvider ("youtube"), videoUrl
- "question": pergunta/quiz com title, options (array de strings)
- "capture": captura de lead com title, subtitle
- "meter": medidor/score com title, subtitle, meterLabel, meterMax (número)
- "calculator": calculadora com title, subtitle, calculatorLabel, calculatorUnit, calculatorMultiplier

Para o tipo "rich", use o campo "sections" para adicionar sub-seções quando necessário:
"sections": [
  {
    "id": "s1",
    "badge": "✅",
    "title": "Benefício",
    "text": "Descrição do benefício"
  }
]

Regras de copywriting:
1. Use linguagem direta, sem rodeios
2. Comece com uma headline que capture atenção imediatamente
3. Crie urgência e escassez de forma natural
4. Use provas sociais específicas com números
5. Quebre objeções antes que surjam
6. Foque na transformação, não no produto
7. Use *palavra* para destacar palavras-chave em azul na headline
8. Crie entre 8 e 14 blocos bem estruturados

Gere agora a landing page completa:`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json({ blocks: parsed.blocks })
  } catch (err: any) {
    console.error('Erro geração página:', err)
    return NextResponse.json({ error: err.message ?? 'Erro ao gerar página' }, { status: 500 })
  }
}