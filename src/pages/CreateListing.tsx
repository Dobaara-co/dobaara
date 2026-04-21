import { useState } from 'react'
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
import { Upload, X } from 'lucide-react'
import { categoryLabels } from '@/data/seedData'

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Select a category'),
  occasion: z.string().optional(),
  condition: z.enum(['excellent', 'very_good', 'good', 'fair']),
  colour: z.string().min(1, 'Enter the colour'),
  designer_brand: z.string().optional(),
  size_label: z.string().min(1, 'Enter the size'),
  bust_cm: z.coerce.number().positive().optional().or(z.literal('')),
  waist_cm: z.coerce.number().positive().optional().or(z.literal('')),
  hips_cm: z.coerce.number().positive().optional().or(z.literal('')),
  length_cm: z.coerce.number().positive().optional().or(z.literal('')),
  price: z.coerce.number().positive('Price must be greater than 0'),
  original_price: z.coerce.number().positive().optional().or(z.literal('')),
  free_postage: z.boolean().default(false),
  postage_price: z.coerce.number().min(0).default(0),
  location: z.string().min(1, 'Enter your location'),
})
type FormValues = z.infer<typeof schema>

const CreateListing = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { free_postage: false, postage_price: 0 },
  })
  const freePostage = watch('free_postage')

  if (!user || !profile) {
    navigate('/auth', { state: { from: '/sell' } })
    return null
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - imageFiles.length)
    setImageFiles((prev) => [...prev, ...files])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreviews((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function uploadImages(): Promise<string[]> {
    const urls: string[] = []
    for (const file of imageFiles) {
      const ext = file.name.split('.').pop()
      const path = `${user!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('listing-images').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
      urls.push(data.publicUrl)
    }
    return urls
  }

  async function onSubmit(values: FormValues) {
    if (imageFiles.length === 0) {
      toast({ title: 'Add at least one photo', variant: 'destructive' })
      return
    }

    setUploading(true)
    let imageUrls: string[] = []
    try {
      imageUrls = await uploadImages()
    } catch {
      toast({ title: 'Image upload failed', variant: 'destructive' })
      setUploading(false)
      return
    }
    setUploading(false)

    const { data, error } = await supabase.from('listings').insert({
      seller_id: user!.id,
      title: values.title,
      description: values.description,
      category: values.category,
      occasion: values.occasion || null,
      condition: values.condition,
      colour: values.colour,
      designer_brand: values.designer_brand || null,
      size_label: values.size_label,
      bust_cm: values.bust_cm !== '' ? Number(values.bust_cm) : null,
      waist_cm: values.waist_cm !== '' ? Number(values.waist_cm) : null,
      hips_cm: values.hips_cm !== '' ? Number(values.hips_cm) : null,
      length_cm: values.length_cm !== '' ? Number(values.length_cm) : null,
      price: Math.round(Number(values.price) * 100),
      original_price: values.original_price !== '' && values.original_price ? Math.round(Number(values.original_price) * 100) : null,
      free_postage: values.free_postage,
      postage_price: values.free_postage ? 0 : Math.round(Number(values.postage_price) * 100),
      images: imageUrls,
      location: values.location,
      ships_from: values.location,
      ships_to: ['UK'],
    }).select().single()

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      return
    }

    queryClient.invalidateQueries({ queryKey: ['listings'] })
    toast({ title: 'Listing live!', description: 'Your item is now on Dobaara.' })
    navigate(`/listing/${data.id}`)
  }

  const categories = Object.entries(categoryLabels)
  const occasions = ['wedding', 'eid', 'diwali', 'mehendi', 'sangeet', 'casual', 'party']
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom', 'One Size']

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">List an Item</h1>
      <p className="text-muted-foreground mb-8">Sell your pre-loved South Asian fashion</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Photos */}
        <div>
          <Label className="text-base font-semibold">Photos <span className="text-destructive">*</span></Label>
          <p className="text-xs text-muted-foreground mb-2">Add up to 6 photos. First photo is the cover image.</p>
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative h-24 w-24 rounded-lg overflow-hidden border border-border">
                <img src={src} className="h-full w-full object-cover" alt="" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 rounded-full bg-foreground/70 p-0.5 text-background"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {imageFiles.length < 6 && (
              <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Add photo</span>
                <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImageSelect} />
              </label>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
          <Input id="title" placeholder="e.g. Sabyasachi Inspired Red Bridal Lehenga" {...register('title')} />
          {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
        </div>

        {/* Category + Occasion */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
            <select id="category" {...register('category')} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select…</option>
              {categories.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
          </div>
          <div>
            <Label htmlFor="occasion">Occasion</Label>
            <select id="occasion" {...register('occasion')} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select…</option>
              {occasions.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {/* Condition */}
        <div>
          <Label>Condition <span className="text-destructive">*</span></Label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {([['excellent', 'Excellent — as good as new'], ['very_good', 'Very Good — minimal signs of wear'], ['good', 'Good — some signs of wear'], ['fair', 'Fair — visible wear']] as const).map(([val, label]) => (
              <label key={val} className="flex items-center gap-2 rounded-lg border border-border p-3 cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="radio" value={val} {...register('condition')} className="text-primary" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
          {errors.condition && <p className="mt-1 text-xs text-destructive">{errors.condition.message}</p>}
        </div>

        {/* Colour + Brand */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="colour">Colour <span className="text-destructive">*</span></Label>
            <Input id="colour" placeholder="e.g. Red, Gold" {...register('colour')} />
            {errors.colour && <p className="mt-1 text-xs text-destructive">{errors.colour.message}</p>}
          </div>
          <div>
            <Label htmlFor="designer_brand">Designer / Brand</Label>
            <Input id="designer_brand" placeholder="e.g. Sabyasachi" {...register('designer_brand')} />
          </div>
        </div>

        {/* Size */}
        <div>
          <Label htmlFor="size_label">Size <span className="text-destructive">*</span></Label>
          <select id="size_label" {...register('size_label')} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Select…</option>
            {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.size_label && <p className="mt-1 text-xs text-destructive">{errors.size_label.message}</p>}
        </div>

        {/* Measurements */}
        <div>
          <Label className="text-sm font-medium">Measurements (cm) — optional</Label>
          <div className="mt-1 grid grid-cols-2 gap-3">
            {(['bust_cm', 'waist_cm', 'hips_cm', 'length_cm'] as const).map((field) => (
              <div key={field}>
                <Label htmlFor={field} className="text-xs text-muted-foreground capitalize">{field.replace('_cm', '')}</Label>
                <Input id={field} type="number" placeholder="cm" {...register(field)} />
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
          <Textarea id="description" rows={4} placeholder="Describe the item — condition details, fabric, what's included, wear history…" {...register('description')} />
          {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
        </div>

        {/* Pricing */}
        <div>
          <Label className="text-base font-semibold">Pricing</Label>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Your Price (£) <span className="text-destructive">*</span></Label>
              <Input id="price" type="number" step="0.01" placeholder="0.00" {...register('price')} />
              {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div>
              <Label htmlFor="original_price">Original Price (£) <span className="text-muted-foreground font-normal">optional</span></Label>
              <Input id="original_price" type="number" step="0.01" placeholder="0.00" {...register('original_price')} />
            </div>
          </div>
        </div>

        {/* Postage */}
        <div>
          <Label className="text-base font-semibold">Postage</Label>
          <label className="mt-2 flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('free_postage')} className="rounded" />
            <span className="text-sm font-medium">Offer free postage</span>
          </label>
          {!freePostage && (
            <div className="mt-2">
              <Label htmlFor="postage_price">Postage Cost (£)</Label>
              <Input id="postage_price" type="number" step="0.01" placeholder="0.00" {...register('postage_price')} />
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location">Your Location <span className="text-destructive">*</span></Label>
          <Input id="location" placeholder="e.g. London" {...register('location')} />
          {errors.location && <p className="mt-1 text-xs text-destructive">{errors.location.message}</p>}
        </div>

        <Button variant="hero" size="lg" type="submit" className="w-full" disabled={isSubmitting || uploading}>
          {uploading ? 'Uploading photos…' : isSubmitting ? 'Publishing…' : 'Publish Listing'}
        </Button>
      </form>
    </div>
  )
}

export default CreateListing
