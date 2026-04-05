'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from './supabase-server'
import { requireAuth } from './auth'

// --- ITEMS ---

export async function addItem(formData: FormData) {
  const user = await requireAuth()
  const supabase = await createClient()

  const name = formData.get('name') as string
  const url = (formData.get('url') as string) || null
  const categoryId = (formData.get('categoryId') as string) || null

  if (!name?.trim()) return { error: 'Nome e obrigatorio' }

  const { error } = await supabase.from('items').insert({
    user_id: user.id,
    name: name.trim(),
    url: url?.trim() || null,
    category_id: categoryId || null,
    is_favorite: false,
    is_purchased: false,
  })

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}

export async function updateItem(id: string, data: {
  name?: string
  url?: string | null
  category_id?: string | null
}) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase.from('items').update(data).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}

export async function deleteItem(id: string) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase.from('items').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('items')
    .update({ is_favorite: isFavorite })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}

export async function togglePurchased(id: string, isPurchased: boolean) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('items')
    .update({ is_purchased: isPurchased })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}

// --- CATEGORIES ---

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
