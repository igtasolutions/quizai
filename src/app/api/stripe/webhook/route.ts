import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'placeholder')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLAN_BY_PRICE: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER ?? '']: 'starter',
  [process.env.STRIPE_PRICE_PRO ?? '']: 'pro',
  [process.env.STRIPE_PRICE_AGENCY ?? '']: 'agency',
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '')
  } catch {
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  const sub = event.data.object as any

  if (['customer.subscription.created', 'customer.subscription.updated'].includes(event.type)) {
    const priceId = sub.items?.data?.[0]?.price?.id ?? ''
    const plan = PLAN_BY_PRICE[priceId] ?? 'starter'
    const customerId = sub.customer as string

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (user) {
      await supabase.rpc('update_user_plan', {
        p_user_id: user.id,
        p_plan: plan,
        p_status: sub.status,
        p_stripe_subscription_id: sub.id,
      })

      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        stripe_subscription_id: sub.id,
        stripe_price_id: priceId,
        plan,
        status: sub.status,
        current_period_start: sub.current_period_start
          ? new Date(sub.current_period_start * 1000).toISOString()
          : null,
        current_period_end: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
      }, { onConflict: 'stripe_subscription_id' })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const customerId = sub.customer as string
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (user) {
      await supabase.rpc('update_user_plan', {
        p_user_id: user.id,
        p_plan: 'starter',
        p_status: 'canceled',
        p_stripe_subscription_id: sub.id,
      })
    }
  }

  return NextResponse.json({ received: true })
}