import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

function welcomeEmailHtml(firstName: string) {
  return `
    <div style="font-family:sans-serif;background:#FAF7F2;padding:32px">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8ddd0">
        <div style="background:#8B5E3C;padding:32px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:28px;letter-spacing:0.12em">DOBAARA</h1>
          <p style="margin:8px 0 0;color:#C9A84C;font-size:13px;letter-spacing:0.1em">South Asian fashion, reimagined.</p>
        </div>
        <div style="padding:36px 32px;text-align:center;color:#3d2b1f">
          <h2 style="margin:0 0 12px;font-size:22px;color:#8B5E3C">Welcome to Dobaara, ${firstName}!</h2>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#5a3e2b">
            You've joined a community of South Asian fashion lovers giving beautiful outfits a second life.
          </p>
          <div style="display:inline-flex;gap:12px;margin-bottom:8px">
            <a href="https://www.dobaara.co/browse"
               style="display:inline-block;background:#8B5E3C;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
              Browse listings
            </a>
            <a href="https://www.dobaara.co/sell"
               style="display:inline-block;background:#C9A84C;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
              List your first item
            </a>
          </div>
        </div>
        <div style="background:#f9f4ef;padding:16px 32px;font-size:12px;color:#999;text-align:center;border-top:1px solid #e8ddd0">
          © 2025 Dobaara · <a href="https://dobaara.co" style="color:#8B5E3C;text-decoration:none">dobaara.co</a>
        </div>
      </div>
    </div>
  `;
}

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type FormValues = z.infer<typeof schema>

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const from = (location.state as { from?: string })?.from ?? '/'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit({ email, password }: FormValues) {
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password)
        toast({ title: 'Check your email', description: 'We sent you a confirmation link.' })
        const firstName = email.split('@')[0].replace(/[^a-zA-Z]/g, '') || 'there'
        const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
        supabase.functions.invoke('send-email', {
          body: { to: email, subject: 'Welcome to Dobaara 🌸', html: welcomeEmailHtml(displayName) },
        })
        return
      }
      navigate(from, { replace: true })
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display">
            {mode === 'signin' ? 'Welcome back' : 'Join Dobaara'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === 'signin'
              ? 'Sign in to your account'
              : 'Create your account to buy and sell'}
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full mb-4"
          type="button"
          onClick={handleGoogle}
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <Button variant="hero" className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="font-medium text-primary hover:underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Auth
