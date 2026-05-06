import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/dashboard/quizzes/new', label: 'Novo Quiz', icon: '⚡' },
  { href: '/dashboard/leads', label: 'Leads', icon: '◉' },
  { href: '/dashboard/tutorials', label: 'Tutoriais', icon: '🎓' },
  { href: '/dashboard/settings', label: 'Configurações', icon: '⚙' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users').select('name, plan').eq('id', user.id).single()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05090f', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        .nav-link { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; color: #4e6a90; text-decoration: none; margin-bottom: 2px; transition: all 0.2s; }
        .nav-link:hover { background: #0d1829 !important; color: #eef2ff !important; }
      `}</style>

      <aside style={{
        width: '200px', background: '#0a1120',
        borderRight: '1px solid #162035',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #162035' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-1px', fontFamily: 'Syne, sans-serif', color: '#eef2ff' }}>
            Quiz<span style={{ color: '#60a5fa' }}>AI</span>
          </div>
          <div style={{ fontSize: '10px', color: '#4e6a90', marginTop: '3px', textTransform: 'capitalize' }}>
            Plano {profile?.plan ?? 'starter'}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {nav.map(item => (
            <Link key={item.href} href={item.href} className="nav-link">
              <span style={{ fontSize: '14px' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid #162035' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563ff, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '800', color: '#fff', flexShrink: 0,
            }}>
              {profile?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#eef2ff' }}>
                {profile?.name?.split(' ')[0] ?? 'Usuário'}
              </div>
              <div style={{ fontSize: '10px', color: '#4e6a90' }}>R$29/mês</div>
            </div>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: '200px', minHeight: '100vh', color: '#eef2ff' }}>
        {children}
      </main>
    </div>
  )
}