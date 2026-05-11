import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type CVInsert = Database['public']['Tables']['cvs']['Insert']

export async function getCVs() {
  const { data, error } = await supabase
    .from('cvs')
    .select('*')
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
    .insert({ ...cv, url: publicUrl })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function setPrimaryCV(id: number) {
  await supabase.from('cvs').update({ is_primary: false }).neq('id', 0)
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
  const { error } = await supabase
    .from('cvs')
    .delete()
    .eq('id', id)
  if (error) throw error
}
