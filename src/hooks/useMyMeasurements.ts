import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface MyMeasurements {
  bustCm?: number
  waistCm?: number
  hipsCm?: number
  heightCm?: number
}

export function useMyMeasurements() {
  const { user } = useAuth()
  return useQuery<MyMeasurements | null>({
    queryKey: ['my-measurements', user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()
      if (error) return null
      const row = data as unknown as Record<string, unknown>
      const num = (key: string) => {
        const v = row[key]
        return v === null || v === undefined ? undefined : Number(v)
      }
      const m: MyMeasurements = {
        bustCm: num('bust_cm'),
        waistCm: num('waist_cm'),
        hipsCm: num('hips_cm'),
        heightCm: num('height_cm'),
      }
      const hasAny = Object.values(m).some((v) => typeof v === 'number' && !Number.isNaN(v))
      return hasAny ? m : null
    },
  })
}
