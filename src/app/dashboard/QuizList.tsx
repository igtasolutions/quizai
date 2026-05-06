'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function QuizList({ quizzes }: { quizzes: any[] }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/q/${slug}`)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!quizzes || quizzes.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {quizzes.map(q => (
        <div key={q.id} style={{
          background: '#0a1120', border: '1px solid #162035',
          borderRadius: '12px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
              background: q.status === 'active' ? '#22c55e' : '#4e6a90',
              boxShadow: q.status === 'active' ? '0 0 8px rgba(34,197,94,0.6)' : 'none',
            }}/>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#eef2ff', marginBottom: '3px' }}>
                {q.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: '#60a5fa', fontFamily: 'monospace' }}>
                  /q/{q.slug}
                </span>
                {q.status === 'active' && (
                  <button
                    onClick={() => copyLink(q.slug)}
                    style={{
                      background: copied === q.slug ? 'rgba(34,197,94,0.1)' : 'rgba(37,99,255,0.1)',
                      border: `1px solid ${copied === q.slug ? 'rgba(34,197,94,0.2)' : 'rgba(37,99,255,0.2)'}`,
                      color: copied === q.slug ? '#22c55e' : '#60a5fa',
                      fontSize: '9px', fontWeight: '600', padding: '2px 8px',
                      borderRadius: '4px', cursor: 'pointer',
                    }}
                  >
                    {copied === q.slug ? '✓ Copiado!' : 'Copiar link'}
                  </button>
                )}
                {q.status !== 'active' && (
                  <span style={{ fontSize: '9px', color: '#4e6a90', background: 'rgba(0,0,0,0.3)', padding: '2px 7px', borderRadius: '4px' }}>
                    Rascunho
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#4e6a90' }}>{q.total_views} views</div>
              <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: '600' }}>{q.total_leads} leads</div>
            </div>
            <Link href={`/dashboard/quizzes/${q.id}`} style={{
              background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)',
              color: '#60a5fa', fontSize: '11px', fontWeight: '600',
              padding: '6px 14px', borderRadius: '6px', textDecoration: 'none',
            }}>
              Editar →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}