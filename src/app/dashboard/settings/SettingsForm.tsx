'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #162035',
  borderRadius: '10px', color: '#eef2ff', fontSize: '13px', padding: '12px 14px',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '10px', color: '#4e6a90',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
}

const cardStyle: React.CSSProperties = {
  background: '#0a1120', border: '1px solid #162035',
  borderRadius: '14px', padding: '22px', marginBottom: '14px',
  position: 'relative', overflow: 'hidden',
}

export default function SettingsForm({ profile, email }: { profile: any; email: string }) {
  const [name, setName] = useState(profile?.name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [pixelId, setPixelId] = useState(profile?.pixel_id ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [msgColor, setMsgColor] = useState('#22c55e')
  const [saving, setSaving] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const showMsg = (text: string, color = '#22c55e') => {
    setMsg(text); setMsgColor(color)
    setTimeout(() => setMsg(''), 3000)
  }

  const saveProfile = async () => {
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, pixel_id: pixelId }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.error) showMsg('Erro: ' + data.error, '#f87171')
    else showMsg('Perfil salvo com sucesso! ✓')
  }

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showMsg('Senha deve ter pelo menos 6 caracteres', '#f87171'); return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (error) showMsg('Erro: ' + error.message, '#f87171')
    else { showMsg('Senha alterada com sucesso! ✓'); setCurrentPassword(''); setNewPassword('') }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  const PLAN_INFO: Record<string, { label: string; quizzes: string; price: string }> = {
    starter: { label: 'Starter', quizzes: '1 quiz ativo', price: 'R$29/mês' },
    pro:     { label: 'Pro',     quizzes: '5 quizzes',   price: 'R$47/mês' },
    agency:  { label: 'Agency',  quizzes: 'Ilimitado',   price: 'R$97/mês' },
  }
  const plan = PLAN_INFO[profile?.plan ?? 'starter']

  return (
    <div>
      {msg && (
        <div style={{ background: `${msgColor}15`, border: `1px solid ${msgColor}40`, borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: msgColor, marginBottom: '16px' }}>
          {msg}
        </div>
      )}

      {/* PLANO */}
      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(37,99,255,0.08), rgba(5,9,15,0.8))' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(37,99,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '12px' }}>Seu plano</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#60a5fa' }}>{plan.label}</div>
            <div style={{ fontSize: '12px', color: '#4e6a90', marginTop: '2px' }}>{plan.quizzes} · {plan.price}</div>
          </div>
          <div style={{ background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', borderRadius: '8px', padding: '6px 14px', fontSize: '11px', color: '#60a5fa', fontWeight: '600' }}>
            {profile?.plan_status === 'active' ? '● Ativo' : profile?.plan_status}
          </div>
        </div>
        {profile?.plan !== 'agency' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {profile?.plan === 'starter' && (
              <button style={{ background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '12px', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 0 14px rgba(37,99,255,0.3)' }}>
                Upgrade para Pro — R$47/mês
              </button>
            )}
            <button style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '12px', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
              Upgrade Agency — R$97/mês
            </button>
          </div>
        )}
      </div>

      {/* PERFIL */}
      <div style={cardStyle}>
        <div style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '16px' }}>Perfil</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={labelStyle}>E-mail</label>
            <input value={email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}/>
          </div>
          <div>
            <label style={labelStyle}>Nome</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo" style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>WhatsApp</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Pixel do Facebook (global)</label>
            <input value={pixelId} onChange={e => setPixelId(e.target.value)} placeholder="ID do Pixel — aplica em todos os quizzes" style={{ ...inputStyle, fontFamily: 'monospace' }}/>
          </div>
          <button onClick={saveProfile} disabled={saving} style={{ background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '13px', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 0 16px rgba(37,99,255,0.3)', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </div>
      </div>

      {/* SENHA */}
      <div style={cardStyle}>
        <div style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '16px' }}>Alterar senha</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Nova senha</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={inputStyle}/>
          </div>
          <button onClick={changePassword} disabled={saving} style={{ background: '#0a1120', border: '1px solid #162035', color: '#4e6a90', fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '13px', padding: '12px', borderRadius: '10px', cursor: 'pointer' }}>
            Alterar senha
          </button>
        </div>
      </div>

      {/* SAIR */}
      <div style={cardStyle}>
        <div style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '10px' }}>Sessão</div>
        <button onClick={logout} style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '13px', padding: '12px', borderRadius: '10px', cursor: 'pointer', width: '100%' }}>
          Sair da conta
        </button>
      </div>
    </div>
  )
}