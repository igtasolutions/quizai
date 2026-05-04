'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handle = async () => {
    setLoading(true)
    setMsg('')
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMsg(error.message)
      else router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` }
      })
      if (error) setMsg(error.message)
      else setMsg('Verifique seu e-mail para confirmar o cadastro.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#05090f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* Glow de fundo */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(37,99,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontSize: '32px', fontWeight: '800', letterSpacing: '-1px',
            fontFamily: 'Syne, sans-serif', color: '#eef2ff',
          }}>
            Quiz<span style={{ color: '#60a5fa' }}>AI</span>
          </div>
          <div style={{ fontSize: '13px', color: '#4e6a90', marginTop: '6px' }}>
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta grátis'}
          </div>
        </div>

        {/* CARD */}
        <div style={{
          background: '#0a1120',
          border: '1px solid #162035',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 0 40px rgba(37,99,255,0.06)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glow no card */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '180px', height: '180px',
            background: 'radial-gradient(circle, rgba(37,99,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}/>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>E-mail</div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handle()}
                placeholder="seu@email.com"
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.4)',
                  border: '1px solid #162035', borderRadius: '10px',
                  color: '#eef2ff', fontSize: '14px', padding: '12px 14px',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#4e6a90', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Senha</div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handle()}
                placeholder="••••••••"
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.4)',
                  border: '1px solid #162035', borderRadius: '10px',
                  color: '#eef2ff', fontSize: '14px', padding: '12px 14px',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {msg && (
            <div style={{
              background: 'rgba(37,99,255,0.08)', border: '1px solid rgba(37,99,255,0.2)',
              borderRadius: '8px', padding: '10px 14px',
              fontSize: '12px', color: '#60a5fa', marginBottom: '16px',
            }}>
              {msg}
            </div>
          )}

          <button
            onClick={handle}
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #2563ff, #1d4ed8)',
              color: '#fff', fontFamily: 'Syne, sans-serif',
              fontWeight: '800', fontSize: '14px',
              padding: '14px', borderRadius: '10px', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: '0 0 24px rgba(37,99,255,0.35)',
              letterSpacing: '-0.2px',
            }}
          >
            {loading ? 'Aguarde...' : isLogin ? 'Entrar →' : 'Criar conta →'}
          </button>

          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              color: '#4e6a90', fontSize: '12px', marginTop: '16px',
              cursor: 'pointer', textAlign: 'center',
            }}
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#4e6a90' }}>
          Crie quiz de vendas em 60 segundos com IA
        </div>
      </div>
    </div>
  )
}