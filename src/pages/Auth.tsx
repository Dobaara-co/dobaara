import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

const signInSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const PASSWORD_MSG =
  'Password must be at least 8 characters and include an uppercase letter, a lowercase letter and a number.'

const signUpSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().refine(
    (val) => val.length >= 8 && /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val),
    { message: PASSWORD_MSG },
  ),
})

type FormValues = {
  first_name?: string
  last_name?: string
  email: string
  password: string
}

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const modeRef = useRef(mode)
  modeRef.current = mode

  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const from = (location.state as { from?: string })?.from ?? '/'

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: (data, context, options) =>
      zodResolver(modeRef.current === 'signup' ? signUpSchema : signInSchema)(data, context, options),
  })

  function toggleMode() {
    setMode(m => (m === 'signin' ? 'signup' : 'signin'))
    reset()
  }

  async function onSubmit({ email, password, first_name, last_name }: FormValues) {
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password)
        navigate(from, { replace: true })
      } else {
        await signUpWithEmail(email, password, first_name ?? '', last_name ?? '')
        toast({
          title: 'Check your email',
          description: 'Click the link we just sent to confirm your account.',
        })
      }
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

        {/* Apple Sign In hidden until it is configured. */}

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
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" type="text" placeholder="Priya" {...register('first_name')} />
                {errors.first_name && <p className="mt-1 text-xs text-destructive">{errors.first_name.message}</p>}
              </div>
              <div>
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" type="text" placeholder="Sharma" {...register('last_name')} />
                {errors.last_name && <p className="mt-1 text-xs text-destructive">{errors.last_name.message}</p>}
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            {mode === 'signup' && !errors.password && (
              <p className="mt-1 text-xs text-muted-foreground">
                Must be at least 8 characters with an uppercase letter, a lowercase letter and a number.
              </p>
            )}
          </div>
          <Button variant="hero" className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={toggleMode}
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
