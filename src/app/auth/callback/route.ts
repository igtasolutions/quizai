import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (code) {
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

    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    // Verifica ativação pendente
    if (session?.user?.email) {
      const email = session.user.email.toLowerCase()
      const { data: pending } = await supabaseAdmin
        .from('pending_activations')
        .select('*')
        .eq('email', email)
        .eq('activated', false)
        .single()

      if (pending) {
        // Ativa o plano
        await supabaseAdmin
          .from('users')
          .update({
            plan: pending.plan,
            plan_status: 'active',
            ai_quiz_limit: pending.ai_quiz_limit,
            manual_quiz_limit: pending.manual_quiz_limit,
            quiz_limit: pending.quiz_limit,
            name: pending.name || undefined,
          })
          .eq('id', session.user.id)

        // Marca como ativada
        await supabaseAdmin
          .from('pending_activations')
          .update({ activated: true })
          .eq('email', email)

        console.log(`✅ Plano ${pending.plan} ativado automaticamente para ${email}`)
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}