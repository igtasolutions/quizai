'use client'
import { useState } from 'react'

const PLANS = [
  { value: 'starter',  label: 'Starter — R$37',  ai: 1,  manual: 2,  total: 3 },
  { value: 'pro',      label: 'Pro — R$67',       ai: 3,  manual: 2,  total: 5 },
  { value: 'business', label: 'Business — R$97',  ai: 10, manual: 0,  total: 10 },
  { value: 'agency',   label: 'Agency — R$197',   ai: 35, manual: 15, total: 50 },
]

export default function AdminUserActions({ user }: { user: any }) {
  const [open, setOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(user.plan ?? 'starter')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [resetting, setResetting] = useState(false)

  const activatePlan = async () => {
    setSaving(true)
    const plan = PLANS.find(p => p.value === selectedPlan)!
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        plan: selectedPlan,
        ai_quiz_limit: plan.ai,
        manual_quiz_limit: plan.manual,
        quiz_limit: plan.total,
        plan_status: 'active',
      }),
    })
    setSaving(false)
    if (res.ok) { setMsg('Plano ativado! ✓'); setOpen(false); setTimeout(() => setMsg(''), 3000) }
    else setMsg('Erro ao ativar')
  }

  const resetCounters = async () => {
    setResetting(true)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        ai_quizzes_used: 0,
        manual_quizzes_used: 0,
      }),
    })
    setResetting(false)
    setMsg('Contadores zerados! ✓')
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div style={{ position: 'relative' }}>
      {msg && <div style={{ fontSize: '10px', color: '#22c55e', marginBottom: '4px' }}>{msg}</div>}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={() => setOpen(!open)}
          style={{ background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: '10px', fontWeight: '600', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' as const }}
        >
          ⚡ Plano
        </button>
        <button
          onClick={resetCounters}
          disabled={resetting}
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24', fontSize: '10px', fontWeight: '600', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' as const }}
        >
          {resetting ? '...' : '↺ Reset'}
        </button>
      </div>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: '32px', background: '#0d1829', border: '1px solid #162035', borderRadius: '10px', padding: '14px', zIndex: 100, minWidth: '220px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#eef2ff', marginBottom: '10px', fontFamily: 'Syne, sans-serif' }}>
            Ativar plano para {user.name || user.email}
          </div>
          <select
            value={selectedPlan}
            onChange={e => setSelectedPlan(e.target.value)}
            style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #162035', borderRadius: '7px', color: '#eef2ff', fontSize: '12px', padding: '8px 10px', outline: 'none', marginBottom: '10px' }}
          >
            {PLANS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <div style={{ fontSize: '10px', color: '#4e6a90', marginBottom: '10px' }}>
            {PLANS.find(p => p.value === selectedPlan)?.ai} IA · {PLANS.find(p => p.value === selectedPlan)?.manual} manuais · {PLANS.find(p => p.value === selectedPlan)?.total} total
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setOpen(false)} style={{ flex: 1, background: 'transparent', border: '1px solid #162035', color: '#4e6a90', fontSize: '11px', padding: '7px', borderRadius: '6px', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button onClick={activatePlan} disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '7px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
              {saving ? '...' : 'Ativar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}