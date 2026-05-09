import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { VirtualModel, ListingTryon } from '@/types/database'

interface Props {
  listingId: string
  /** Called whenever the active try-on image changes so the parent can update the hero. */
  onTryonChange: (url: string | null) => void
}

export default function ModelSelector({ listingId, onTryonChange }: Props) {
  const queryClient = useQueryClient()
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [generating, setGenerating] = useState<string | null>(null) // model_id being generated

  // Load all virtual models ordered by display_order
  const { data: models = [] } = useQuery<VirtualModel[]>({
    queryKey: ['virtual-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('virtual_models')
        .select('*')
        .order('display_order')
      if (error) throw error
      return data ?? []
    },
    staleTime: Infinity, // models don't change
  })

  // Load existing try-ons for this listing
  const { data: tryons = [] } = useQuery<ListingTryon[]>({
    queryKey: ['listing-tryons', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listing_tryons')
        .select('*')
        .eq('listing_id', listingId)
      if (error) throw error
      return data ?? []
    },
    staleTime: 30_000,
  })

  // Derive the default (Tara) model id once models are loaded
  const defaultModel = models.find((m) => m.is_default)
  const activeModelId = selectedModelId ?? defaultModel?.id ?? null

  function getTryonForModel(modelId: string): ListingTryon | undefined {
    return tryons.find((t) => t.model_id === modelId)
  }

  async function handleModelSelect(model: VirtualModel) {
    setSelectedModelId(model.id)
    const tryon = getTryonForModel(model.id)
    onTryonChange(tryon?.tryon_image_url ?? null)
  }

  async function handleGenerate(model: VirtualModel) {
    if (!model.reference_image_url) return // no reference image yet
    setGenerating(model.id)
    try {
      const { data, error } = await supabase.functions.invoke('generate-tryon', {
        body: { listing_id: listingId, model_id: model.id },
      })
      if (error) throw error
      if (data?.tryon_image_url) {
        // Invalidate so the tryons query refetches
        await queryClient.invalidateQueries({ queryKey: ['listing-tryons', listingId] })
        onTryonChange(data.tryon_image_url)
      }
    } catch (err) {
      console.error('[ModelSelector] generate-tryon error:', err)
    } finally {
      setGenerating(null)
    }
  }

  if (models.length === 0) return null

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Try on with a model
      </p>

      {/* Model cards */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {models.map((model) => {
          const isSelected = model.id === activeModelId
          const tryon = getTryonForModel(model.id)
          const hasImage = !!tryon
          const isGenerating = generating === model.id
          const canGenerate = !!model.reference_image_url

          return (
            <button
              key={model.id}
              onClick={() => handleModelSelect(model)}
              className={`flex-shrink-0 flex flex-col items-center rounded-xl border-2 px-3 py-2.5 transition-colors text-left w-[88px] ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background hover:border-primary/40'
              }`}
            >
              {/* Avatar circle */}
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold mb-1.5 ${
                  hasImage
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {model.name[0]}
              </div>
              <span className="text-xs font-semibold leading-tight text-center">{model.name}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight mt-0.5">
                {model.height}
              </span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {model.size_range}
              </span>
              {hasImage && (
                <span className="mt-1 text-[9px] font-semibold text-primary uppercase tracking-wide">
                  Ready
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Generate button — shown when selected model has no try-on */}
      {activeModelId && (() => {
        const activeModel = models.find((m) => m.id === activeModelId)
        const hasTryon = !!getTryonForModel(activeModelId)
        if (hasTryon || !activeModel) return null
        const canGenerate = !!activeModel.reference_image_url
        const isGenerating = generating === activeModelId

        return (
          <div className="mt-3">
            {canGenerate ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => handleGenerate(activeModel)}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Generating try-on…</>
                ) : (
                  `Generate try-on with ${activeModel.name}`
                )}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                Try-on for {activeModel.name} coming soon
              </p>
            )}
          </div>
        )
      })()}
    </div>
  )
}
