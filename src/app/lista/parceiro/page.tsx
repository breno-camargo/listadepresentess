'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Item, Category } from '@/types'
import ItemList from '@/components/ItemList'
import CategoryFilter from '@/components/CategoryFilter'
import Spinner from '@/components/Spinner'

export default function ParceiroListaPage() {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFavorites, setShowFavorites] = useState(false)
  const [loading, setLoading] = useState(true)
  const [noPartner, setNoPartner] = useState(false)

  const supabase = createClient()

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .neq('id', user.id)
      .limit(1)

    const partnerId = profiles?.[0]?.id
    if (!partnerId) {
      setNoPartner(true)
      setLoading(false)
      return
    }

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
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const hasFavorites = items.some(i => i.is_favorite)

  let filtered = selectedCategory
    ? items.filter(i => i.category_id === selectedCategory)
    : items

  if (showFavorites) {
    filtered = filtered.filter(i => i.is_favorite)
  }

  const usedCategoryIds = new Set(items.map(i => i.category_id).filter(Boolean))
  const usedCategories = categories.filter(c => usedCategoryIds.has(c.id))

  if (loading) return <Spinner />

  if (noPartner) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--color-text-light)' }}>
        <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💌</p>
        <p style={{ fontWeight: 700 }}>Seu parceiro(a) ainda nao entrou no app.</p>
        <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Quando ele(a) logar, a lista vai aparecer aqui!</p>
      </div>
    )
  }

  return (
    <>
      <CategoryFilter
        categories={usedCategories}
        selected={selectedCategory}
        onChange={(id) => {
          setSelectedCategory(id)
          setShowFavorites(false)
        }}
        extraFilters={hasFavorites ? [
          {
            label: '♥ Mais desejados',
            active: showFavorites,
            onClick: () => {
              setShowFavorites(!showFavorites)
              setSelectedCategory(null)
            },
          }
        ] : undefined}
      />
      <div style={{ marginTop: '12px' }}>
        <ItemList items={filtered} editable={false} onUpdate={loadData} />
      </div>
    </>
  )
}
