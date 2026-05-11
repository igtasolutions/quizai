'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PagesPage() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/page')
      .then(r => r.json())
      .then(({ pages }) => { setPages(pages ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const deletePage = async (id: string) => {
    if (!confirm('Arquivar esta página?')) return
    await fetch(`/api/page/${id}`, { method: 'DELETE' })
    setPages(ps => ps.filter(p => p.id !== id))
  }

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            Minhas Páginas
          </h1>
          <p style={{ fontSize: '13px', color: '#4e6a90', margin: 0 }}>
            Landing pages criadas com IA ou manualmente
          </p>
        </div>
        <Link href="/dashboard/pages/new" style={{ background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '12px', padding: '10px 18px', borderRadius: '9px', textDecoration: 'none', boxShadow: '0 0 16px rgba(37,99,255,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>+</span> Nova Página
        </Link>
      </div>

      {/* LOADING */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#4e6a90' }}>Carregando...</div>
      )}

      {/* EMPTY */}
      {!loading && pages.length === 0 && (
        <div style={{ background: '#0a1120', border: '1px dashed #162035', borderRadius: '20px', padding: '72px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '300px', height: '200px', background: 'radial-gradient(ellipse, rgba(37,99,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }}/>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗂️</div>
          <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#eef2ff', marginBottom: '8px' }}>
            Crie sua primeira landing page
          </div>
          <p style={{ fontSize: '13px', color: '#4e6a90', marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px' }}>
            Descreva seu produto e a IA monta uma landing page de alta conversão em segundos
          </p>
          <Link href="/dashboard/pages/new" style={{ background: 'linear-gradient(135deg, #2563ff, #1d4ed8)', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '13px', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', boxShadow: '0 0 20px rgba(37,99,255,0.3)' }}>
            Criar agora →
          </Link>
        </div>
      )}

      {/* LIST */}
      {!loading && pages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pages.map(page => (
            <div key={page.id} style={{ background: '#0a1120', border: '1px solid #162035', borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: page.is_ai_generated ? 'rgba(167,139,250,0.1)' : 'rgba(37,99,255,0.1)', border: `1px solid ${page.is_ai_generated ? 'rgba(167,139,250,0.2)' : 'rgba(37,99,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                {page.is_ai_generated ? '⚡' : '📄'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#eef2ff', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {page.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: page.status === 'active' ? '#22c55e' : '#4e6a90', boxShadow: page.status === 'active' ? '0 0 6px #22c55e' : 'none' }}/>
                    <span style={{ fontSize: '11px', color: page.status === 'active' ? '#22c55e' : '#4e6a90' }}>{page.status === 'active' ? 'Publicada' : 'Rascunho'}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#2e4560' }}>·</span>
                  <span style={{ fontSize: '11px', color: '#2e4560' }}>{page.blocks_draft?.length ?? 0} blocos</span>
                  {page.is_ai_generated && (
                    <>
                      <span style={{ fontSize: '11px', color: '#2e4560' }}>·</span>
                      <span style={{ fontSize: '11px', color: '#a78bfa' }}>Gerada por IA</span>
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {page.status === 'active' && (
                  <a href={`/p/${page.slug}`} target="_blank" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '11px', fontWeight: '600', padding: '6px 12px', borderRadius: '7px', textDecoration: 'none' }}>
                    Ver →
                  </a>
                )}
                <button onClick={() => router.push(`/dashboard/pages/${page.id}`)} style={{ background: '#0f1a2e', border: '1px solid #162035', color: '#4e6a90', fontSize: '11px', fontWeight: '600', padding: '6px 12px', borderRadius: '7px', cursor: 'pointer' }}>
                  Editar
                </button>
                <button onClick={() => deletePage(page.id)} style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', color: '#f87171', fontSize: '11px', fontWeight: '600', padding: '6px 12px', borderRadius: '7px', cursor: 'pointer' }}>
                  Arquivar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}