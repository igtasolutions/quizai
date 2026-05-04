import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QuizAI — Crie quiz de vendas em 60 segundos',
  description: 'Descreva seu produto. A IA monta o quiz completo. Link instantâneo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={dmSans.className} style={{ background: '#05090f', color: '#eef2ff' }}>
        {children}
      </body>
    </html>
  )
}