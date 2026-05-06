'use client'
import { useState } from 'react'

interface Tutorial {
  id: string
  title: string
  description: string
  video_url: string
  category: string
  order_index: number
  published: boolean
}

const CATEGORIES = [
  { value: 'primeiros-passos', label: '🚀 Primeiros passos' },
  { value: 'editor', label: '✏️ Editor de blocos' },
  { value: 'conversao', label: '📈 Conversão' },
  { value: 'cobranca', label: '💳 Planos e cobrança' },
]

const inp: React.CSSProperties = { width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #162035', borderRadius: '8px', color: '#eef2ff', fontSize: '12px', padding: '9px 12px', outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif' }

export default function AdminTutorials({ tutorials: initial }: { tutorials: Tutorial[] }) {
  const [tutorials, setTutorials] = useState<Tutorial[]>(initial)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const [form, setForm] = useState({
    title: '', description: '', video_url: '', category: 'primeiros-passos', order_index: 0, published: true
  })

  const showMsg = (text: string) => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  const save = async (tutorial?: Tutorial) => {
    setSaving(true)
    const isNew = !tutorial
    const res = await fetch('/api/admin/tutorials', {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isNew ? form : { id: tutorial.id, ...form }),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      if (isNew) {
        setTutorials(prev => [...prev, data.tutorial])
        setAdding(false)
        setForm({ title: '', description: '', video_url: '', category: 'primeiros-passos', order_index: 0, published: true })
      } else {
        setTutorials(prev => prev.map(t => t.id === data.tutorial.id ? data.tutorial : t))
        setEditing(null)
      }
      showMsg('Salvo! ✓')
    } else {
      showMsg('Erro ao salvar')
    }
  }

  const deleteTutorial = async (id: string) => {
    if (!confirm('Remover este tutorial?')) return
    await fetch('/api/admin/tutorials', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setTutorials(prev => prev.filter(t => t.id !== id))
    showMsg('Removido!')
  }

  const togglePublish = async (t: Tutorial) => {
    await fetch('/api/admin/tutorials', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id, published: !t.published }),
    })
    setTutorials(prev => prev.map(x => x.id === t.id ? { ...x, published: !x.published } : x))
  }

  const startEdit = (t: Tutorial) => {
    setForm({ title: t.title, description: t.description, video_url: t.video_url, category: t.category, order_index: t.order_index, published: t.published })
    setEditing(t.id)
    setAdding(false)
  }

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = tutorials.filter(t => t.category === cat.value)
    return acc
  }, {} as Record<string, Tutorial[]>)

  const FormPanel = ({ onSave }: { onSave: () => void }) => (
    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #162035', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Título</label>
          <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Como criar seu primeiro quiz..." style={inp}/>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Descrição</label>
          <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2} style={{ ...inp, resize: 'none' }}/>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>URL do vídeo (YouTube ou Loom)</label>
          <input value={form.video_url} onChange={e => setForm(f => ({...f, video_url: e.target.value}))} placeholder="https://youtube.com/watch?v=..." style={inp}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Categoria</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} style={{ ...inp }}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Ordem</label>
            <input type="number" value={form.order_index} onChange={e => setForm(f => ({...f, order_index: Number(e.target.value)}))} style={inp}/>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onSave} disabled={saving} style={{ flex: 2, background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontSize: '12px', fontWeight: '700', padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          <button onClick={() => { setAdding(false); setEditing(null) }} style={{ flex: 1, background: 'transparent', border: '1px solid #162035', color: '#4e6a90', fontSize: '12px', padding: '9px', borderRadius: '8px', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {msg && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#22c55e', marginBottom: '16px' }}>{msg}</div>}

      <button onClick={() => { setAdding(true); setEditing(null) }} style={{ background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '12px', padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '20px', boxShadow: '0 0 16px rgba(37,99,255,0.3)' }}>
        + Novo tutorial
      </button>

      {adding && <FormPanel onSave={() => save()} />}

      {CATEGORIES.map(cat => (
        <div key={cat.value} style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>{cat.label}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(grouped[cat.value] ?? []).length === 0 && (
              <div style={{ fontSize: '12px', color: '#4e6a90', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>Nenhum tutorial nesta categoria</div>
            )}
            {(grouped[cat.value] ?? []).map(t => (
              <div key={t.id}>
                <div style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#eef2ff' }}>{t.title}</div>
                      {!t.published && <span style={{ fontSize: '9px', background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', padding: '1px 6px', borderRadius: '4px' }}>Oculto</span>}
                    </div>
                    {t.description && <div style={{ fontSize: '11px', color: '#4e6a90' }}>{t.description}</div>}
                    {t.video_url && <div style={{ fontSize: '10px', color: '#60a5fa', fontFamily: 'monospace', marginTop: '2px' }}>{t.video_url.substring(0, 50)}...</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button onClick={() => togglePublish(t)} style={{ background: t.published ? 'rgba(34,197,94,0.1)' : 'rgba(100,100,100,0.1)', border: `1px solid ${t.published ? 'rgba(34,197,94,0.2)' : 'rgba(100,100,100,0.2)'}`, color: t.published ? '#22c55e' : '#4e6a90', fontSize: '10px', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer' }}>
                      {t.published ? '● Visível' : '○ Oculto'}
                    </button>
                    <button onClick={() => startEdit(t)} style={{ background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: '10px', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer' }}>Editar</button>
                    <button onClick={() => deleteTutorial(t.id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '10px', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer' }}>✕</button>
                  </div>
                </div>
                {editing === t.id && <FormPanel onSave={() => save(t)} />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}