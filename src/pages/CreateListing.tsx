import React, { forwardRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { Upload, X, Info } from 'lucide-react'
import { categoryLabels } from '@/data/seedData'

// ── helpers ───────────────────────────────────────────────────────────────────

const MARGIN_HELP =
  'Turn the garment inside out and measure the folded fabric inside the side seam. ' +
  'Listings with a margin recorded sell better — buyers can see the piece can be let out.'

const STRUCTURED_CATEGORIES = new Set(['lehenga', 'saree', 'salwar_kameez', 'anarkali', 'sherwani'])

const numOrNull = (v: unknown): number | null => {
  if (v === '' || v == null) return null
  const n = Number(v)
  return isNaN(n) || n <= 0 ? null : n
}

// ── CmInput ───────────────────────────────────────────────────────────────────

const CmInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function CmInput({ onChange, ...props }, ref) {
    const [inches, setInches] = useState('')
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      const v = parseFloat(e.target.value)
      setInches(!isNaN(v) && v > 0 ? `≈ ${(v / 2.54).toFixed(1)}"` : '')
    }
    return (
      <div className="flex items-center gap-2 mt-1">
        <Input ref={ref} type="number" step="0.5" min="0" onChange={handleChange} {...props} />
        <span className="w-14 shrink-0 text-xs text-muted-foreground tabular-nums">{inches}</span>
      </div>
    )
  }
)

// ── small layout helpers ──────────────────────────────────────────────────────

function Field({
  id, label, req, err, children,
}: { id: string; label: string; req?: boolean; err?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}{req && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {err && <p className="mt-1 text-xs text-destructive">{err}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <p className="text-sm font-medium">{title}</p>
      {children}
    </div>
  )
}

function MarginField({ id, register: reg }: { id: string; register: React.InputHTMLAttributes<HTMLInputElement> }) {
  return (
    <div className="pt-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground flex items-center gap-1">
        Margin <Info className="h-3 w-3 text-muted-foreground/60" />
      </Label>
      <CmInput id={id} placeholder="cm" {...reg} />
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{MARGIN_HELP}</p>
    </div>
  )
}

// ── schema ────────────────────────────────────────────────────────────────────

const num = z.coerce.number().positive().optional().or(z.literal(''))

const schema = z
  .object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    category: z.string().min(1, 'Select a category'),
    occasion: z.string().optional(),
    condition: z.enum(['excellent', 'very_good', 'good', 'fair']),
    colour: z.string().min(1, 'Enter the colour'),
    designer_brand: z.string().optional(),
    size_label: z.string().min(1, 'Enter the size'),
    price: z.coerce.number().positive('Price must be greater than 0'),
    original_price: z.coerce.number().positive().optional().or(z.literal('')),
    free_postage: z.boolean().default(false),
    postage_price: z.coerce.number().min(0).default(0),
    location: z.string().min(1, 'Enter your location'),
    // shared
    stitching_status: z.enum(['stitched', 'semi_stitched', 'unstitched']).optional().or(z.literal('')),
    waist_type: z.enum(['elastic', 'drawstring', 'fixed', 'zip']).optional().or(z.literal('')),
    height_min_cm: num,
    height_max_cm: num,
    alteration_notes: z.string().optional(),
    // blouse / top (lehenga, saree with blouse, kameez)
    blouse_bust_cm: num,
    blouse_waist_cm: num,
    blouse_length_cm: num,
    shoulder_cm: num,
    sleeve_length_cm: num,
    blouse_margin_cm: num,
    // skirt (lehenga)
    skirt_waist_cm: num,
    skirt_length_cm: num,
    skirt_flare_cm: num,
    skirt_margin_cm: num,
    // saree
    saree_length_cm: num,
    saree_width_cm: num,
    fall_pico_attached: z.boolean().default(false),
    blouse_included: z.boolean().default(false),
    // salwar kameez
    kameez_bust_cm: num,
    kameez_waist_cm: num,
    kameez_hip_cm: num,
    kameez_length_cm: num,
    kameez_margin_cm: num,
    salwar_waist_cm: num,
    salwar_length_cm: num,
    // anarkali
    anarkali_bust_cm: num,
    anarkali_waist_cm: num,
    anarkali_full_length_cm: num,
    anarkali_flare_cm: num,
    anarkali_margin_cm: num,
    // sherwani
    sherwani_chest_cm: num,
    sherwani_full_length_cm: num,
    sherwani_margin_cm: num,
    trouser_waist_cm: num,
    trouser_length_cm: num,
    // dupatta (lehenga, salwar_kameez, anarkali)
    dupatta_included: z.boolean().default(false),
    dupatta_length_cm: num,
    dupatta_width_cm: num,
    // other / general
    margin_cm: num,
  })
  .superRefine((data, ctx) => {
    const req = (field: string, label: string) => {
      const v = data[field as keyof typeof data]
      if (v === '' || v == null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: `${label} is required` })
      }
    }
    const cat = data.category
    if (cat === 'lehenga') {
      req('blouse_bust_cm', 'Blouse bust')
      req('blouse_waist_cm', 'Blouse waist')
      req('skirt_length_cm', 'Skirt length')
    } else if (cat === 'saree') {
      req('saree_length_cm', 'Saree length')
      req('saree_width_cm', 'Saree width')
    } else if (cat === 'salwar_kameez') {
      req('kameez_bust_cm', 'Kameez bust')
      req('kameez_waist_cm', 'Kameez waist')
      req('kameez_length_cm', 'Kameez length')
    } else if (cat === 'anarkali') {
      req('anarkali_bust_cm', 'Bust')
      req('anarkali_waist_cm', 'Waist')
      req('anarkali_full_length_cm', 'Full length')
    } else if (cat === 'sherwani') {
      req('sherwani_chest_cm', 'Chest')
      req('sherwani_full_length_cm', 'Full length')
    }
  })

type FormValues = z.infer<typeof schema>

// ── component ─────────────────────────────────────────────────────────────────

const CreateListing = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { free_postage: false, postage_price: 0, fall_pico_attached: false, blouse_included: false, dupatta_included: false },
  })

  const [category, blouseIncluded, dupattaIncluded, freePostage] = watch([
    'category', 'blouse_included', 'dupatta_included', 'free_postage',
  ])

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

    const { data, error } = await supabase
      .from('listings')
      .insert({
        seller_id: user!.id,
        title: values.title,
        description: values.description,
        category: values.category,
        occasion: values.occasion || null,
        condition: values.condition,
        colour: values.colour,
        designer_brand: values.designer_brand || null,
        size_label: values.size_label,
        price: Math.round(Number(values.price) * 100),
        original_price:
          values.original_price !== '' && values.original_price
            ? Math.round(Number(values.original_price) * 100)
            : null,
        free_postage: values.free_postage,
        postage_price: values.free_postage
          ? 0
          : Math.round(Number(values.postage_price) * 100),
        images: imageUrls,
        location: values.location,
        ships_from: values.location,
        ships_to: ['UK'],
        // shared measurement fields
        stitching_status: values.stitching_status || null,
        waist_type: values.waist_type || null,
        height_min_cm: numOrNull(values.height_min_cm),
        height_max_cm: numOrNull(values.height_max_cm),
        alteration_notes: values.alteration_notes || null,
        // blouse / top
        blouse_bust_cm: numOrNull(values.blouse_bust_cm),
        blouse_waist_cm: numOrNull(values.blouse_waist_cm),
        blouse_length_cm: numOrNull(values.blouse_length_cm),
        shoulder_cm: numOrNull(values.shoulder_cm),
        sleeve_length_cm: numOrNull(values.sleeve_length_cm),
        blouse_margin_cm: numOrNull(values.blouse_margin_cm),
        // skirt
        skirt_waist_cm: numOrNull(values.skirt_waist_cm),
        skirt_length_cm: numOrNull(values.skirt_length_cm),
        skirt_flare_cm: numOrNull(values.skirt_flare_cm),
        skirt_margin_cm: numOrNull(values.skirt_margin_cm),
        // saree
        saree_length_cm: numOrNull(values.saree_length_cm),
        saree_width_cm: numOrNull(values.saree_width_cm),
        fall_pico_attached: values.fall_pico_attached,
        blouse_included: values.blouse_included,
        // salwar kameez
        kameez_bust_cm: numOrNull(values.kameez_bust_cm),
        kameez_waist_cm: numOrNull(values.kameez_waist_cm),
        kameez_hip_cm: numOrNull(values.kameez_hip_cm),
        kameez_length_cm: numOrNull(values.kameez_length_cm),
        kameez_margin_cm: numOrNull(values.kameez_margin_cm),
        salwar_waist_cm: numOrNull(values.salwar_waist_cm),
        salwar_length_cm: numOrNull(values.salwar_length_cm),
        // anarkali
        anarkali_bust_cm: numOrNull(values.anarkali_bust_cm),
        anarkali_waist_cm: numOrNull(values.anarkali_waist_cm),
        anarkali_full_length_cm: numOrNull(values.anarkali_full_length_cm),
        anarkali_flare_cm: numOrNull(values.anarkali_flare_cm),
        anarkali_margin_cm: numOrNull(values.anarkali_margin_cm),
        // sherwani
        sherwani_chest_cm: numOrNull(values.sherwani_chest_cm),
        sherwani_full_length_cm: numOrNull(values.sherwani_full_length_cm),
        sherwani_margin_cm: numOrNull(values.sherwani_margin_cm),
        trouser_waist_cm: numOrNull(values.trouser_waist_cm),
        trouser_length_cm: numOrNull(values.trouser_length_cm),
        // dupatta
        dupatta_included: values.dupatta_included,
        dupatta_length_cm: numOrNull(values.dupatta_length_cm),
        dupatta_width_cm: numOrNull(values.dupatta_width_cm),
        // other / fallback
        margin_cm: numOrNull(values.margin_cm),
      })
      .select()
      .single()

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      return
    }

    queryClient.invalidateQueries({ queryKey: ['listings'] })
    supabase.functions.invoke('generate-tryon', { body: { listing_id: data.id } })
    toast({
      title: 'Listing live!',
      description: 'Your item is now on Dobaara. A virtual try-on is being generated.',
    })
    navigate(`/listing/${data.id}`)
  }

  const categories = Object.entries(categoryLabels)
  const occasions = ['wedding', 'eid', 'diwali', 'mehendi', 'sangeet', 'casual', 'party']
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom', 'One Size']

  const isStructured = STRUCTURED_CATEGORIES.has(category)

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">List an Item</h1>
      <p className="text-muted-foreground mb-8">Sell your pre-loved South Asian fashion</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Photos */}
        <div>
          <Label className="text-base font-semibold">
            Photos <span className="text-destructive">*</span>
          </Label>
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
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input id="title" placeholder="e.g. Sabyasachi Inspired Red Bridal Lehenga" {...register('title')} />
          {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
        </div>

        {/* Category + Occasion */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <select
              id="category"
              {...register('category')}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select…</option>
              {categories.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
          </div>
          <div>
            <Label htmlFor="occasion">Occasion</Label>
            <select
              id="occasion"
              {...register('occasion')}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select…</option>
              {occasions.map((o) => (
                <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Condition */}
        <div>
          <Label>
            Condition <span className="text-destructive">*</span>
          </Label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {(
              [
                ['excellent', 'Excellent — as good as new'],
                ['very_good', 'Very Good — minimal signs of wear'],
                ['good', 'Good — some signs of wear'],
                ['fair', 'Fair — visible wear'],
              ] as const
            ).map(([val, label]) => (
              <label
                key={val}
                className="flex items-center gap-2 rounded-lg border border-border p-3 cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
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
            <Label htmlFor="colour">
              Colour <span className="text-destructive">*</span>
            </Label>
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
          <Label htmlFor="size_label">
            Size <span className="text-destructive">*</span>
          </Label>
          <select
            id="size_label"
            {...register('size_label')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select…</option>
            {sizes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.size_label && <p className="mt-1 text-xs text-destructive">{errors.size_label.message}</p>}
        </div>

        {/* ── MEASUREMENTS ─────────────────────────────────────────────────── */}
        {category && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Measurements</Label>
              <Link
                to="/size-guide"
                className="text-xs text-primary underline underline-offset-2"
              >
                How to measure your garment →
              </Link>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Enter values in cm — the inches equivalent is shown as you type.
              Required fields are marked <span className="text-destructive">*</span>.
            </p>

            {/* ── LEHENGA ──────────────────────────────────────────────────── */}
            {category === 'lehenga' && (
              <div className="space-y-3">
                <Section title="Blouse">
                  <div className="grid grid-cols-2 gap-3">
                    <Field id="blouse_bust_cm" label="Bust" req err={errors.blouse_bust_cm?.message}>
                      <CmInput id="blouse_bust_cm" placeholder="cm" {...register('blouse_bust_cm')} />
                    </Field>
                    <Field id="blouse_waist_cm" label="Waist" req err={errors.blouse_waist_cm?.message}>
                      <CmInput id="blouse_waist_cm" placeholder="cm" {...register('blouse_waist_cm')} />
                    </Field>
                    <Field id="blouse_length_cm" label="Length">
                      <CmInput id="blouse_length_cm" placeholder="cm" {...register('blouse_length_cm')} />
                    </Field>
                    <Field id="shoulder_cm" label="Shoulder">
                      <CmInput id="shoulder_cm" placeholder="cm" {...register('shoulder_cm')} />
                    </Field>
                    <Field id="sleeve_length_cm" label="Sleeve length">
                      <CmInput id="sleeve_length_cm" placeholder="cm" {...register('sleeve_length_cm')} />
                    </Field>
                  </div>
                  <MarginField id="blouse_margin_cm" register={register('blouse_margin_cm')} />
                </Section>

                <Section title="Skirt">
                  <div className="grid grid-cols-2 gap-3">
                    <Field id="skirt_waist_cm" label="Waist">
                      <CmInput id="skirt_waist_cm" placeholder="cm" {...register('skirt_waist_cm')} />
                    </Field>
                    <Field id="skirt_length_cm" label="Length" req err={errors.skirt_length_cm?.message}>
                      <CmInput id="skirt_length_cm" placeholder="cm" {...register('skirt_length_cm')} />
                    </Field>
                    <Field id="skirt_flare_cm" label="Flare / ghera">
                      <CmInput id="skirt_flare_cm" placeholder="cm" {...register('skirt_flare_cm')} />
                    </Field>
                  </div>
                  <MarginField id="skirt_margin_cm" register={register('skirt_margin_cm')} />
                </Section>

                <DupattaSection dupattaIncluded={dupattaIncluded} register={register} />
              </div>
            )}

            {/* ── SAREE ────────────────────────────────────────────────────── */}
            {category === 'saree' && (
              <div className="space-y-3">
                <Section title="Saree">
                  <div className="grid grid-cols-2 gap-3">
                    <Field id="saree_length_cm" label="Length" req err={errors.saree_length_cm?.message}>
                      <CmInput id="saree_length_cm" placeholder="cm" {...register('saree_length_cm')} />
                    </Field>
                    <Field id="saree_width_cm" label="Width" req err={errors.saree_width_cm?.message}>
                      <CmInput id="saree_width_cm" placeholder="cm" {...register('saree_width_cm')} />
                    </Field>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" {...register('fall_pico_attached')} className="rounded" />
                      Fall &amp; pico attached
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" {...register('blouse_included')} className="rounded" />
                      Blouse included
                    </label>
                  </div>
                </Section>

                {blouseIncluded && (
                  <Section title="Blouse">
                    <div className="grid grid-cols-2 gap-3">
                      <Field id="blouse_bust_cm" label="Bust">
                        <CmInput id="blouse_bust_cm" placeholder="cm" {...register('blouse_bust_cm')} />
                      </Field>
                      <Field id="blouse_waist_cm" label="Waist">
                        <CmInput id="blouse_waist_cm" placeholder="cm" {...register('blouse_waist_cm')} />
                      </Field>
                      <Field id="blouse_length_cm" label="Length">
                        <CmInput id="blouse_length_cm" placeholder="cm" {...register('blouse_length_cm')} />
                      </Field>
                      <Field id="shoulder_cm" label="Shoulder">
                        <CmInput id="shoulder_cm" placeholder="cm" {...register('shoulder_cm')} />
                      </Field>
                      <Field id="sleeve_length_cm" label="Sleeve length">
                        <CmInput id="sleeve_length_cm" placeholder="cm" {...register('sleeve_length_cm')} />
                      </Field>
                    </div>
                    <MarginField id="blouse_margin_cm" register={register('blouse_margin_cm')} />
                  </Section>
                )}
              </div>
            )}

            {/* ── SALWAR KAMEEZ ─────────────────────────────────────────────── */}
            {category === 'salwar_kameez' && (
              <div className="space-y-3">
                <Section title="Kameez">
                  <div className="grid grid-cols-2 gap-3">
                    <Field id="kameez_bust_cm" label="Bust" req err={errors.kameez_bust_cm?.message}>
                      <CmInput id="kameez_bust_cm" placeholder="cm" {...register('kameez_bust_cm')} />
                    </Field>
                    <Field id="kameez_waist_cm" label="Waist" req err={errors.kameez_waist_cm?.message}>
                      <CmInput id="kameez_waist_cm" placeholder="cm" {...register('kameez_waist_cm')} />
                    </Field>
                    <Field id="kameez_hip_cm" label="Hip">
                      <CmInput id="kameez_hip_cm" placeholder="cm" {...register('kameez_hip_cm')} />
                    </Field>
                    <Field id="kameez_length_cm" label="Length" req err={errors.kameez_length_cm?.message}>
                      <CmInput id="kameez_length_cm" placeholder="cm" {...register('kameez_length_cm')} />
                    </Field>
                    <Field id="shoulder_cm" label="Shoulder">
                      <CmInput id="shoulder_cm" placeholder="cm" {...register('shoulder_cm')} />
                    </Field>
                    <Field id="sleeve_length_cm" label="Sleeve length">
                      <CmInput id="sleeve_length_cm" placeholder="cm" {...register('sleeve_length_cm')} />
                    </Field>
                  </div>
                  <MarginField id="kameez_margin_cm" register={register('kameez_margin_cm')} />
                </Section>

                <Section title="Salwar">
                  <div className="grid grid-cols-2 gap-3">
                    <Field id="salwar_waist_cm" label="Waist">
                      <CmInput id="salwar_waist_cm" placeholder="cm" {...register('salwar_waist_cm')} />
                    </Field>
                    <Field id="salwar_length_cm" label="Length">
                      <CmInput id="salwar_length_cm" placeholder="cm" {...register('salwar_length_cm')} />
                    </Field>
                  </div>
                </Section>

                <DupattaSection dupattaIncluded={dupattaIncluded} register={register} />
              </div>
            )}

            {/* ── ANARKALI ─────────────────────────────────────────────────── */}
            {category === 'anarkali' && (
              <div className="space-y-3">
                <Section title="Anarkali">
                  <div className="grid grid-cols-2 gap-3">
                    <Field id="anarkali_bust_cm" label="Bust" req err={errors.anarkali_bust_cm?.message}>
                      <CmInput id="anarkali_bust_cm" placeholder="cm" {...register('anarkali_bust_cm')} />
                    </Field>
                    <Field id="anarkali_waist_cm" label="Waist" req err={errors.anarkali_waist_cm?.message}>
                      <CmInput id="anarkali_waist_cm" placeholder="cm" {...register('anarkali_waist_cm')} />
                    </Field>
                    <Field
                      id="anarkali_full_length_cm"
                      label="Full length"
                      req
                      err={errors.anarkali_full_length_cm?.message}
                    >
                      <CmInput
                        id="anarkali_full_length_cm"
                        placeholder="cm"
                        {...register('anarkali_full_length_cm')}
                      />
                    </Field>
                    <Field id="anarkali_flare_cm" label="Flare / ghera">
                      <CmInput id="anarkali_flare_cm" placeholder="cm" {...register('anarkali_flare_cm')} />
                    </Field>
                    <Field id="shoulder_cm" label="Shoulder">
                      <CmInput id="shoulder_cm" placeholder="cm" {...register('shoulder_cm')} />
                    </Field>
                    <Field id="sleeve_length_cm" label="Sleeve length">
                      <CmInput id="sleeve_length_cm" placeholder="cm" {...register('sleeve_length_cm')} />
                    </Field>
                  </div>
                  <MarginField id="anarkali_margin_cm" register={register('anarkali_margin_cm')} />
                </Section>

                <DupattaSection dupattaIncluded={dupattaIncluded} register={register} />
              </div>
            )}

            {/* ── SHERWANI ─────────────────────────────────────────────────── */}
            {category === 'sherwani' && (
              <div className="space-y-3">
                <Section title="Sherwani">
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      id="sherwani_chest_cm"
                      label="Chest"
                      req
                      err={errors.sherwani_chest_cm?.message}
                    >
                      <CmInput id="sherwani_chest_cm" placeholder="cm" {...register('sherwani_chest_cm')} />
                    </Field>
                    <Field
                      id="sherwani_full_length_cm"
                      label="Full length"
                      req
                      err={errors.sherwani_full_length_cm?.message}
                    >
                      <CmInput
                        id="sherwani_full_length_cm"
                        placeholder="cm"
                        {...register('sherwani_full_length_cm')}
                      />
                    </Field>
                    <Field id="shoulder_cm" label="Shoulder">
                      <CmInput id="shoulder_cm" placeholder="cm" {...register('shoulder_cm')} />
                    </Field>
                    <Field id="sleeve_length_cm" label="Sleeve length">
                      <CmInput id="sleeve_length_cm" placeholder="cm" {...register('sleeve_length_cm')} />
                    </Field>
                  </div>
                  <MarginField id="sherwani_margin_cm" register={register('sherwani_margin_cm')} />
                </Section>

                <Section title="Trousers / Churidar">
                  <div className="grid grid-cols-2 gap-3">
                    <Field id="trouser_waist_cm" label="Waist">
                      <CmInput id="trouser_waist_cm" placeholder="cm" {...register('trouser_waist_cm')} />
                    </Field>
                    <Field id="trouser_length_cm" label="Length">
                      <CmInput id="trouser_length_cm" placeholder="cm" {...register('trouser_length_cm')} />
                    </Field>
                  </div>
                </Section>
              </div>
            )}

            {/* ── OTHER / UNSTRUCTURED ─────────────────────────────────────── */}
            {!isStructured && (
              <Section title="Measurements">
                <p className="text-xs text-muted-foreground">
                  For this category you can note any margin available for alteration.
                </p>
                <Field id="margin_cm" label="Margin (if applicable)">
                  <CmInput id="margin_cm" placeholder="cm" {...register('margin_cm')} />
                </Field>
                <p className="text-xs text-muted-foreground">{MARGIN_HELP}</p>
              </Section>
            )}

            {/* ── SHARED: stitching · waist type · height · notes ─────────── */}
            <Section title="Additional details">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stitching_status" className="text-xs text-muted-foreground">
                    Stitching status
                  </Label>
                  <select
                    id="stitching_status"
                    {...register('stitching_status')}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select…</option>
                    <option value="stitched">Stitched</option>
                    <option value="semi_stitched">Semi-stitched</option>
                    <option value="unstitched">Unstitched</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="waist_type" className="text-xs text-muted-foreground">
                    Waist type
                  </Label>
                  <select
                    id="waist_type"
                    {...register('waist_type')}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select…</option>
                    <option value="elastic">Elastic</option>
                    <option value="drawstring">Drawstring (naada)</option>
                    <option value="fixed">Fixed hook-and-eye</option>
                    <option value="zip">Zip</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">
                  Best height range (optional)
                </Label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <Field id="height_min_cm" label="Min height">
                    <CmInput id="height_min_cm" placeholder="cm" {...register('height_min_cm')} />
                  </Field>
                  <Field id="height_max_cm" label="Max height">
                    <CmInput id="height_max_cm" placeholder="cm" {...register('height_max_cm')} />
                  </Field>
                </div>
              </div>

              <div>
                <Label htmlFor="alteration_notes" className="text-xs text-muted-foreground">
                  Alteration notes
                </Label>
                <Textarea
                  id="alteration_notes"
                  rows={2}
                  placeholder="e.g. Blouse can be let out by 2 inches on each side. Skirt hem can be shortened."
                  className="mt-1"
                  {...register('alteration_notes')}
                />
              </div>
            </Section>
          </div>
        )}

        {/* Description */}
        <div>
          <Label htmlFor="description">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="Describe the item — condition details, fabric, what's included, wear history…"
            {...register('description')}
          />
          {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
        </div>

        {/* Pricing */}
        <div>
          <Label className="text-base font-semibold">Pricing</Label>
          <p className="mt-1 text-sm text-muted-foreground">
            You keep 100% of your listing price. Buyers cover protection and postage separately.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">
                Your Price (£) <span className="text-destructive">*</span>
              </Label>
              <Input id="price" type="number" step="0.01" placeholder="0.00" {...register('price')} />
              {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div>
              <Label htmlFor="original_price">
                Original Price (£){' '}
                <span className="text-muted-foreground font-normal">optional</span>
              </Label>
              <Input
                id="original_price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('original_price')}
              />
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
              <Input
                id="postage_price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('postage_price')}
              />
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location">
            Your Location <span className="text-destructive">*</span>
          </Label>
          <Input id="location" placeholder="e.g. London" {...register('location')} />
          {errors.location && <p className="mt-1 text-xs text-destructive">{errors.location.message}</p>}
        </div>

        <Button
          variant="hero"
          size="lg"
          type="submit"
          className="w-full"
          disabled={isSubmitting || uploading}
        >
          {uploading ? 'Uploading photos…' : isSubmitting ? 'Publishing…' : 'Publish Listing'}
        </Button>
      </form>
    </div>
  )
}

// ── DupattaSection (shared by lehenga, salwar_kameez, anarkali) ───────────────

function DupattaSection({
  dupattaIncluded,
  register,
}: {
  dupattaIncluded: boolean
  register: ReturnType<typeof useForm<FormValues>>['register']
}) {
  return (
    <Section title="Dupatta">
      <label className="flex items-center gap-2 cursor-pointer text-sm">
        <input type="checkbox" {...register('dupatta_included')} className="rounded" />
        Dupatta included
      </label>
      {dupattaIncluded && (
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Field id="dupatta_length_cm" label="Length">
            <CmInput id="dupatta_length_cm" placeholder="cm" {...register('dupatta_length_cm')} />
          </Field>
          <Field id="dupatta_width_cm" label="Width">
            <CmInput id="dupatta_width_cm" placeholder="cm" {...register('dupatta_width_cm')} />
          </Field>
        </div>
      )}
    </Section>
  )
}

export default CreateListing
