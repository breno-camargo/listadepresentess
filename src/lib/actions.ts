'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from './supabase-server'
import { requireAuth } from './auth'

export async function addCategory(name: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  if (!name?.trim()) return { error: 'Nome e obrigatorio' }

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name: name.trim(),
  })

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}

export async function deleteCategory(id: string) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}
