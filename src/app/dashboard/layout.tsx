import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/dashboard/quizzes/new', label: 'Novo Quiz', icon: '⚡' },
  { href: '/dashboard/leads', label: 'Leads', icon: '◉' },
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
    <div className="flex min-h-screen bg-[#05090f]">
      <aside className="w-48 bg-[#0a1120] border-r border-[#162035] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[#162035]">
          <div className="font-bold text-lg">
            Quiz<span className="text-blue-400">AI</span>
          </div>
          <div className="text-[10px] text-[#4e6a90] mt-0.5">Plano {profile?.plan ?? 'starter'}</div>
        </div>
        <nav className="flex-1 p-2">
          {nav.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium text-[#4e6a90] hover:text-[#eef2ff] hover:bg-[#0d1829] transition-all mb-0.5">
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[#162035]">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold">
              {profile?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <div className="text-[11px] font-medium">{profile?.name?.split(' ')[0]}</div>
              <div className="text-[10px] text-[#4e6a90]">R$29/mês</div>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}