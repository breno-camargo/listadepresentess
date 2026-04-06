'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Item, Category } from '@/types'
import ItemList from '@/components/ItemList'
import CategoryFilter from '@/components/CategoryFilter'
import Fab from '@/components/Fab'
import ItemForm from '@/components/ItemForm'
import CategoryManager from '@/components/CategoryManager'

export default function MinhaListaPage() {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showCategories, setShowCategories] = useState(false)

  const supabase = createClient()

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [itemsRes, catsRes] = await Promise.all([
      supabase
        .from('items')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name'),
    ])

    if (itemsRes.data) setItems(itemsRes.data)
    if (catsRes.data) setCategories(catsRes.data)
  }

  useEffect(() => {
    loadData()
  }, [showForm, showCategories])

  const filtered = selectedCategory
    ? items.filter(i => i.category_id === selectedCategory)
    : items

  // so mostra categorias que tem pelo menos 1 item
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
        <ItemList items={filtered} editable={true} />
      </div>
      <Fab onClick={() => setShowForm(true)} />
      {showForm && (
        <ItemForm
          categories={categories}
          onClose={() => setShowForm(false)}
          onManageCategories={() => {
            setShowForm(false)
            setShowCategories(true)
          }}
        />
      )}
      {showCategories && (
        <CategoryManager
          categories={categories}
          onClose={() => setShowCategories(false)}
        />
      )}
    </>
  )
}
