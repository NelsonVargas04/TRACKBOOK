import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type CLInsert = Database['public']['Tables']['cover_letters']['Insert']
type CLUpdate = Database['public']['Tables']['cover_letters']['Update']

export async function getCoverLetters() {
  const { data, error } = await supabase
    .from('cover_letters')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createCoverLetter(cl: CLInsert) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('cover_letters')
    .insert({ ...cl, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCoverLetter(id: number, updates: CLUpdate) {
  const { data, error } = await supabase
    .from('cover_letters')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function setPrimaryCoverLetter(id: number) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  await supabase.from('cover_letters').update({ is_primary: false }).eq('user_id', user.id)
  const { data, error } = await supabase
    .from('cover_letters')
    .update({ is_primary: true })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCoverLetter(id: number) {
  const { error } = await supabase
    .from('cover_letters')
    .delete()
    .eq('id', id)
  if (error) throw error
}
