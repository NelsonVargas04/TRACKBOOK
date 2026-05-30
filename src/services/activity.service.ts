import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type ActivityRow    = Database['public']['Tables']['activity_entries']['Row']
type ActivityInsert = Database['public']['Tables']['activity_entries']['Insert']
type ActivityUpdate = Database['public']['Tables']['activity_entries']['Update']

export async function getActivity(applicationId: number) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('activity_entries')
    .select('*')
    .eq('application_id', applicationId)
    .eq('user_id', user.id)
    .order('date', { ascending: false })
  if (error) throw error
  return data as ActivityRow[]
}

export async function addActivityEntry(entry: ActivityInsert) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('activity_entries')
    .insert({ ...entry, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data as ActivityRow
}

export async function updateActivityEntry(id: number, updates: ActivityUpdate) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('activity_entries')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()
  if (error) throw error
  return data as ActivityRow
}

export async function deleteActivityEntry(id: number) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('activity_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw error
}
