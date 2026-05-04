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
    <div className="min-h-screen flex items-center justify-center bg-[#05090f] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold mb-2">
            Quiz<span className="text-blue-400">AI</span>
          </div>
          <p className="text-sm text-[#4e6a90]">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta grátis'}
          </p>
        </div>
        <div className="bg-[#0a1120] border border-[#162035] rounded-2xl p-6">
          <div className="flex flex-col gap-3 mb-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-3 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff]"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full bg-black/40 border border-[#162035] rounded-lg px-3 py-3 text-sm focus:border-blue-500/60 focus:outline-none text-[#eef2ff]"
            />
          </div>
          {msg && <p className="text-xs text-blue-400 mb-3">{msg}</p>}
          <button
            onClick={handle}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-[0_0_20px_rgba(37,99,255,0.3)] disabled:opacity-50"
          >
            {loading ? 'Aguarde...' : isLogin ? 'Entrar →' : 'Criar conta →'}
          </button>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-center text-xs text-[#4e6a90] mt-4 hover:text-[#eef2ff] transition-colors"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </button>
        </div>
      </div>
    </div>
  )
}