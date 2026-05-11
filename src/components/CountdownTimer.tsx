'use client'
import { useState, useEffect } from 'react'

export default function CountdownTimer({ seconds, theme }: { seconds: number; theme: any }) {
  const [secs, setSecs] = useState(seconds)

  useEffect(() => {
    const iv = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(iv)
  }, [])

  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
      {[{ v: pad(h), l: 'HORAS' }, { v: pad(m), l: 'MIN' }, { v: pad(s), l: 'SEG' }].map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'monospace', color: theme.accent }}>{item.v}</div>
            <div style={{ fontSize: '10px', color: theme.muted }}>{item.l}</div>
          </div>
          {i < 2 && <span style={{ color: theme.muted, fontSize: '24px' }}>:</span>}
        </div>
      ))}
    </div>
  )
}