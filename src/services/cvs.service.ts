import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type CVInsert = Database['public']['Tables']['cvs']['Insert']

export async function getCVs() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('cvs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createCV(cv: CVInsert, file: File) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const path = `${user.id}/cvs/${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, file)
  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(path)

  const { data, error } = await supabase
    .from('cvs')
    .insert({ ...cv, user_id: user.id, url: publicUrl })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function setPrimaryCV(id: number) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  await supabase.from('cvs').update({ is_primary: false }).eq('user_id', user.id)
  const { data, error } = await supabase
    .from('cvs')
    .update({ is_primary: true })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCV(id: number) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('cvs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw error
}
