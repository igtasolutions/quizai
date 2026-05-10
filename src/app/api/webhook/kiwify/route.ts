import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const NAME_TO_PLAN: Record<string, { plan: string; ai: number; manual: number; total: number }> = {
  'starter':  { plan: 'starter',  ai: 1,  manual: 2,  total: 3 },
  'pro':      { plan: 'pro',      ai: 3,  manual: 2,  total: 5 },
  'business': { plan: 'business', ai: 10, manual: 0,  total: 10 },
  'agency':   { plan: 'agency',   ai: 35, manual: 15, total: 50 },
}

const PRICE_TO_PLAN: Record<number, { plan: string; ai: number; manual: number; total: number }> = {
  3700:  { plan: 'starter',  ai: 1,  manual: 2,  total: 3 },
  6700:  { plan: 'pro',      ai: 3,  manual: 2,  total: 5 },
  9700:  { plan: 'business', ai: 10, manual: 0,  total: 10 },
  19700: { plan: 'agency',   ai: 35, manual: 15, total: 50 },
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha1', secret)
  hmac.update(body)
  const computed = hmac.digest('hex')
  return computed === signature
}

function identifyPlan(data: any) {
  // 1. Tenta pelo nome da oferta/plano da assinatura
  const planName = (data.Subscription?.plan?.name ?? '').toLowerCase()
  if (planName) {
    const found = Object.entries(NAME_TO_PLAN).find(([key]) => planName.includes(key))
    if (found) return found[1]
  }

  // 2. Tenta pelo valor pago
  const amount = data.Commissions?.product_base_price ?? 0
  if (amount && PRICE_TO_PLAN[amount]) return PRICE_TO_PLAN[amount]

  // 3. Tenta pelo nome do produto
  const productName = (data.Product?.product_name ?? '').toLowerCase()
  if (productName) {
    const found = Object.entries(NAME_TO_PLAN).find(([key]) => productName.includes(key))
    if (found) return found[1]
  }

  // 4. Tenta pelo order_ref ou outros campos
  const orderRef = (data.order_ref ?? '').toLowerCase()
  if (orderRef) {
    const found = Object.entries(NAME_TO_PLAN).find(([key]) => orderRef.includes(key))
    if (found) return found[1]
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-kiwify-signature') ?? ''
    const secret = process.env.KIWIFY_WEBHOOK_SECRET ?? ''

    if (secret && signature) {
      const valid = verifySignature(rawBody, signature, secret)
      if (!valid) {
        console.error('Kiwify webhook: assinatura inválida')
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
      }
    }

    const data = JSON.parse(rawBody)
    console.log('Kiwify webhook:', JSON.stringify(data).substring(0, 500))

    const event = data.webhook_event_type ?? data.type ?? data.event ?? data.order_status ?? ''
    const customerEmail = (data.Customer?.email ?? data.customer?.email ?? data.email ?? '').toLowerCase()
    const customerName = data.Customer?.full_name ?? data.customer?.name ?? ''

    console.log('Event:', event, 'Email:', customerEmail)

    const approvedEvents = ['order_approved', 'purchase_approved', 'approved', 'paid', 'completed']
    const isApproved = approvedEvents.some(e => event?.toLowerCase().includes(e.toLowerCase()))

    if (!isApproved) {
      console.log('Evento ignorado:', event)
      return NextResponse.json({ ok: true, message: 'Evento ignorado' })
    }

    if (!customerEmail) {
      console.error('Email do cliente não encontrado')
      return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })
    }

    const config = identifyPlan(data)
    if (!config) {
      const planName = data.Subscription?.plan?.name
      const amount = data.Commissions?.product_base_price
      console.error('Plano não identificado. Nome:', planName, 'Valor:', amount)
      return NextResponse.json({ 
        error: 'Plano não identificado', 
        plan_name: planName, 
        amount,
        tip: 'Verifique se o nome da oferta na Kiwify contém: starter, pro, business ou agency'
      }, { status: 400 })
    }

    console.log('Plano identificado:', config.plan)

    // Busca usuário pelo email
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id, plan')
      .eq('email', customerEmail)
      .single()

    if (userData) {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          plan: config.plan,
          plan_status: 'active',
          ai_quiz_limit: config.ai,
          manual_quiz_limit: config.manual,
          quiz_limit: config.total,
          ai_quizzes_used: 0,
          manual_quizzes_used: 0,
        })
        .eq('id', userData.id)

      if (error) throw error

      console.log(`✅ Plano ${config.plan} ativado para ${customerEmail}`)
      return NextResponse.json({ ok: true, message: `Plano ${config.plan} ativado`, user_id: userData.id })
    } else {
      console.log(`⚠️ Usuário não encontrado: ${customerEmail}`)
      await supabaseAdmin
        .from('pending_activations')
        .upsert({
          email: customerEmail,
          name: customerName,
          plan: config.plan,
          ai_quiz_limit: config.ai,
          manual_quiz_limit: config.manual,
          quiz_limit: config.total,
          created_at: new Date().toISOString(),
        })
       .then(({ error: e }) => { if (e) console.log('pending_activations erro:', e.message) })

      return NextResponse.json({ ok: true, message: 'Compra registrada — usuário ainda não cadastrado' })
    }
  } catch (error) {
    console.error('Erro no webhook Kiwify:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}