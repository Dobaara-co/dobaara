import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      try {
        const url = window.location.href
        const hasCode = new URL(url).searchParams.get('code')
        if (hasCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(url)
          if (error) throw error
        }
        const { data, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (!data.session) throw new Error('No session established')
        navigate('/account', { replace: true })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed'
        setError(message)
      }
    }
    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAF7F2' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold font-display mb-2" style={{ color: '#8B5E3C' }}>Sign in failed</h1>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <a href="/auth" className="text-sm font-medium underline" style={{ color: '#8B5E3C' }}>
            Back to sign in
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="text-center">
        <h1 className="text-3xl font-bold font-display mb-6" style={{ color: '#8B5E3C' }}>DOBAARA</h1>
        <svg
          className="mx-auto mb-4 animate-spin"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: '#8B5E3C' }}
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  )
}