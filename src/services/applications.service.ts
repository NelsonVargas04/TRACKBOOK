import { supabase } from '@/lib/supabase'
import type { Database, Status } from '@/lib/database.types'

type AppRow    = Database['public']['Tables']['applications']['Row']
type AppInsert = Database['public']['Tables']['applications']['Insert']

type AppWithActivity = AppRow & { activity_entries: Database['public']['Tables']['activity_entries']['Row'][] }

export async function getApplications(): Promise<AppWithActivity[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*, activity_entries(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as AppWithActivity[]
}

export async function getApplicationById(id: number): Promise<AppWithActivity> {
  const { data, error } = await supabase
    .from('applications')
    .select('*, activity_entries(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as AppWithActivity
}

export async function createApplication(app: AppInsert) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('applications')
    .insert({ ...app, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateApplication(id: number, updates: Partial<AppRow>) {
  const { data, error } = await supabase
    .from('applications')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateApplicationStatus(id: number, status: Status) {
  return updateApplication(id, { status })
}

export async function deleteApplication(id: number) {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id)
  if (error) throw error
}
