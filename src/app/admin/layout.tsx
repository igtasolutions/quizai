import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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
    .from('users').select('is_admin, name').eq('id', user.id).single()

  if (!profile?.is_admin) redirect('/dashboard')

  const nav = [
    { href: '/admin', label: '📊 Overview' },
    { href: '/admin/users', label: '👥 Usuários' },
    { href: '/admin/quizzes', label: '⚡ Quizzes' },
    { href: '/admin/tutorials', label: '🎓 Tutoriais' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05090f', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        .admin-nav-link { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; color: #4e6a90; text-decoration: none; margin-bottom: 2px; transition: all 0.2s; }
        .admin-nav-link:hover { background: #0d1829; color: #eef2ff; }
      `}</style>

      <aside style={{ width: '200px', background: '#0a1120', borderRight: '1px solid #162035', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #162035' }}>
          <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-1px', fontFamily: 'Syne, sans-serif', color: '#eef2ff' }}>
            Quiz<span style={{ color: '#60a5fa' }}>AI</span>
            <span style={{ fontSize: '10px', fontWeight: '600', color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>ADMIN</span>
          </div>
          <div style={{ fontSize: '10px', color: '#4e6a90', marginTop: '3px' }}>{profile?.name}</div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {nav.map(item => (
            <Link key={item.href} href={item.href} className="admin-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid #162035' }}>
          <Link href="/dashboard" className="admin-nav-link" style={{ color: '#4e6a90', fontSize: '11px' }}>
            ← Voltar ao dashboard
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: '200px', minHeight: '100vh', color: '#eef2ff' }}>
        {children}
      </main>
    </div>
  )
}