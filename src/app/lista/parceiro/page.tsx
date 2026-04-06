'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Item, Category } from '@/types'
import ItemList from '@/components/ItemList'
import CategoryFilter from '@/components/CategoryFilter'

export default function ParceiroListaPage() {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const supabase = createClient()

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .neq('id', user.id)
      .limit(1)

    const partnerId = profiles?.[0]?.id
    if (!partnerId) return

    const [itemsRes, catsRes] = await Promise.all([
      supabase
        .from('items')
        .select('*, category:categories(*)')
        .eq('user_id', partnerId)
        .order('created_at', { ascending: false }),
      supabase
        .from('categories')
        .select('*')
        .eq('user_id', partnerId)
        .order('name'),
    ])

    if (itemsRes.data) setItems(itemsRes.data)
    if (catsRes.data) setCategories(catsRes.data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = selectedCategory
    ? items.filter(i => i.category_id === selectedCategory)
    : items

  const usedCategoryIds = new Set(items.map(i => i.category_id).filter(Boolean))
  const usedCategories = categories.filter(c => usedCategoryIds.has(c.id))

  return (
    <>
      <CategoryFilter
        categories={usedCategories}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />
      <div style={{ marginTop: '12px' }}>
        <ItemList items={filtered} editable={false} />
      </div>
    </>
  )
}
