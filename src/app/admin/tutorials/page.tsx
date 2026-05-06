import { createClient } from '@supabase/supabase-js'
import AdminTutorials from './AdminTutorials'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminTutorialsPage() {
  const { data: tutorials } = await supabaseAdmin
    .from('tutorials')
    .select('*')
    .order('order_index', { ascending: true })

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Tutoriais
        </h1>
        <p style={{ fontSize: '13px', color: '#4e6a90', margin: 0 }}>
          Gerencie os tutoriais que aparecem para os usuários
        </p>
      </div>
      <AdminTutorials tutorials={tutorials ?? []} />
    </div>
  )
}