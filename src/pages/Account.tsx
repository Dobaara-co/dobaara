import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, Package } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers and underscores only'),
  bio: z.string().max(200, 'Max 200 characters').optional(),
  location: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const Account = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      full_name: profile?.full_name ?? '',
      username: profile?.username ?? '',
      bio: profile?.bio ?? '',
      location: profile?.location ?? '',
    },
  })

  if (!user || !profile) {
    navigate('/auth', { state: { from: '/account' } })
    return null
  }

  async function onSubmit(values: FormValues) {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: values.full_name,
        username: values.username,
        bio: values.bio ?? null,
        location: values.location ?? null,
      })
      .eq('id', user!.id)

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Profile updated' })
      queryClient.invalidateQueries({ queryKey: ['profile', user!.id] })
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="container py-10 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
          <LogOut className="h-4 w-4 mr-1" /> Sign out
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-8 p-4 rounded-lg border border-border bg-card">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback>{profile.full_name?.[0] ?? profile.username[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{profile.full_name ?? profile.username}</p>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
        </div>
      </div>

      <div className="mb-8 p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Selling</span>
        </div>
        <div className="flex gap-8 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{profile.total_sales_count}</p>
            <p className="text-xs text-muted-foreground">Total Sales</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{Number(profile.average_rating).toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => navigate('/sell')}>
          + List an item for sale
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <h2 className="text-lg font-semibold">Edit Profile</h2>
        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" {...register('full_name')} />
          {errors.full_name && <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>}
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
            <Input id="username" className="pl-7" {...register('username')} />
          </div>
          {errors.username && <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>}
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" placeholder="e.g. London" {...register('location')} />
        </div>
        <div>
          <Label htmlFor="bio">Bio <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea id="bio" rows={3} placeholder="Tell buyers a bit about yourself…" {...register('bio')} />
          {errors.bio && <p className="mt-1 text-xs text-destructive">{errors.bio.message}</p>}
        </div>
        <Button variant="hero" type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}

export default Account
