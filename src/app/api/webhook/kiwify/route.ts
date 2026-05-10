import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLAN_CONFIG: Record<string, { plan: string; ai: number; manual: number; total: number }> = {
  [process.env.KIWIFY_PRODUCT_STARTER ?? 'starter']: { plan: 'starter',  ai: 1,  manual: 2,  total: 3 },
  [process.env.KIWIFY_PRODUCT_PRO ?? 'pro']:          { plan: 'pro',      ai: 3,  manual: 2,  total: 5 },
  [process.env.KIWIFY_PRODUCT_BUSINESS ?? 'business']:{ plan: 'business', ai: 10, manual: 0,  total: 10 },
  [process.env.KIWIFY_PRODUCT_AGENCY ?? 'agency']:    { plan: 'agency',   ai: 35, manual: 15, total: 50 },
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha1', secret)
  hmac.update(body)
  const computed = hmac.digest('hex')
  return computed === signature
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-kiwify-signature') ?? ''
    const secret = process.env.KIWIFY_WEBHOOK_SECRET ?? ''

    // Verifica assinatura se secret estiver configurado
    if (secret && signature) {
      const valid = verifySignature(rawBody, signature, secret)
      if (!valid) {
        console.error('Kiwify webhook: assinatura inválida')
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
      }
    }

    const data = JSON.parse(rawBody)
    console.log('Kiwify webhook COMPLETO:', JSON.stringify(data))

    const event = data.type ?? data.event ?? data.order_status ?? data.status ?? ''
    const productId = data.Product?.id ?? data.product?.id ?? data.product_id ?? ''
    const customerEmail = data.Customer?.email ?? data.customer?.email ?? data.email ?? ''
    const customerName = data.Customer?.full_name ?? data.customer?.name ?? data.name ?? ''

    console.log('Event:', event, 'Product:', productId, 'Email:', customerEmail)

    // Só processa compras aprovadas
    const approvedEvents = ['order_approved', 'purchase_approved', 'approved', 'paid', 'completed']
const isApproved = approvedEvents.some(e => event?.toLowerCase().includes(e.toLowerCase())) || data.order_status === 'paid'

    if (!isApproved) {
      console.log('Evento ignorado:', event)
      return NextResponse.json({ ok: true, message: 'Evento ignorado' })
    }

    if (!customerEmail) {
      console.error('Email do cliente não encontrado no webhook')
      return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })
    }

    // Determina o plano pelo produto
    const planConfig = PLAN_CONFIG[productId]
    if (!planConfig) {
      console.error('Produto não mapeado:', productId, 'Produtos configurados:', Object.keys(PLAN_CONFIG))
      // Tenta pelo nome do produto
      const productName = (data.product?.name ?? data.Product?.name ?? '').toLowerCase()
      const planByName = Object.values(PLAN_CONFIG).find(p => productName.includes(p.plan))
      if (!planByName) {
        return NextResponse.json({ error: `Produto não mapeado: ${productId}` }, { status: 400 })
      }
      Object.assign(planConfig ?? {}, planByName)
    }

    const config = planConfig ?? Object.values(PLAN_CONFIG).find(p =>
      (data.product?.name ?? '').toLowerCase().includes(p.plan)
    )

    if (!config) {
      return NextResponse.json({ error: 'Plano não identificado' }, { status: 400 })
    }

    // Busca usuário pelo email
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id, plan')
      .eq('email', customerEmail.toLowerCase())
      .single()

    if (userData) {
      // Usuário existe — atualiza o plano
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          plan: config.plan,
          plan_status: 'active',
          ai_quiz_limit: config.ai,
          manual_quiz_limit: config.manual,
          quiz_limit: config.total,
          // Zera contadores ao fazer upgrade
          ai_quizzes_used: 0,
          manual_quizzes_used: 0,
        })
        .eq('id', userData.id)

      if (error) throw error

      console.log(`✅ Plano ${config.plan} ativado para ${customerEmail}`)
      return NextResponse.json({ ok: true, message: `Plano ${config.plan} ativado`, user_id: userData.id })
    } else {
      // Usuário não existe — cria conta pendente
      // O usuário precisará se cadastrar com o mesmo email
      console.log(`⚠️ Usuário não encontrado: ${customerEmail} — compra registrada mas conta não existe`)

      // Salva compra pendente para quando o usuário se cadastrar
      const { error } = await supabaseAdmin
        .from('pending_activations')
        .upsert({
          email: customerEmail.toLowerCase(),
          name: customerName,
          plan: config.plan,
          ai_quiz_limit: config.ai,
          manual_quiz_limit: config.manual,
          quiz_limit: config.total,
          product_id: productId,
          created_at: new Date().toISOString(),
        })

      if (error) {
        // Tabela pode não existir ainda — log e continua
        console.log('Tabela pending_activations não existe ainda:', error.message)
      }

      return NextResponse.json({ ok: true, message: 'Compra registrada — usuário ainda não cadastrado' })
    }
  } catch (error) {
    console.error('Erro no webhook Kiwify:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}