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

        // If a code is present in the query string, exchange it for a session.
        const hasCode = new URL(url).searchParams.get('code')
        if (hasCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(url)
          if (error) throw error
        }

        // Confirm we have a session (covers implicit/hash flow too via detectSessionInUrl).
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {error ? (
          <>
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">
              Sign-in failed
            </h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={() => navigate('/auth', { replace: true })}
              className="text-primary underline underline-offset-4"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">
              Signing you in…
            </h1>
            <p className="text-muted-foreground">One moment while we complete your sign-in.</p>
          </>
        )}
      </div>
    </div>
  )
}
