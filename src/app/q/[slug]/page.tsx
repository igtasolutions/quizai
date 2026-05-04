import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import QuizPlayer from '@/components/quiz/QuizPlayer'

export default async function QuizPage(props: any) {
  const params = await props.params
  const slug = params.slug

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!quiz) notFound()

  return <QuizPlayer quiz={quiz as any} />
}