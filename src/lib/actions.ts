'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from './supabase-server'
import { requireAuth } from './auth'

export async function addCategory(name: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const trimmed = name?.trim()
  if (!trimmed || trimmed.length > 50) return { error: 'Nome inválido' }

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name: trimmed,
  })

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}
