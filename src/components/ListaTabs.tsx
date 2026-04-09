'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Item, Category } from '@/types'
import TabNav from './TabNav'
import ItemList from './ItemList'
import CategoryFilter from './CategoryFilter'
import ItemForm from './ItemForm'
import CategoryManager from './CategoryManager'
import Spinner from './Spinner'
import styles from './ListaTabs.module.css'

interface ListaTabsProps {
  partnerName: string
}

export default function ListaTabs({ partnerName }: ListaTabsProps) {
  const [activeTab, setActiveTab] = useState<'minha' | 'parceiro'>('minha')
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  // minha lista
  const [myItems, setMyItems] = useState<Item[]>([])
  const [myCategories, setMyCategories] = useState<Category[]>([])
  const [myFilter, setMyFilter] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showCategories, setShowCategories] = useState(false)

  // parceiro
  const [partnerItems, setPartnerItems] = useState<Item[]>([])
  const [partnerCategories, setPartnerCategories] = useState<Category[]>([])
  const [partnerFilter, setPartnerFilter] = useState<string | null>(null)
  const [showFavorites, setShowFavorites] = useState(false)
  const [noPartner, setNoPartner] = useState(false)

  const [loading, setLoading] = useState(true)
  const [animating, setAnimating] = useState(false)
  const supabase = createClient()

  async function loadMyData() {
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

    if (itemsRes.data) setMyItems(itemsRes.data)
    if (catsRes.data) setMyCategories(catsRes.data)
  }

  async function loadPartnerData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .neq('id', user.id)
      .limit(1)

    const partnerId = profiles?.[0]?.id
    if (!partnerId) {
      setNoPartner(true)
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

    if (itemsRes.data) setPartnerItems(itemsRes.data)
    if (catsRes.data) setPartnerCategories(catsRes.data)
  }

  async function loadAll() {
    await Promise.all([loadMyData(), loadPartnerData()])
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    if (!showForm && !showCategories) loadMyData()
  }, [showForm, showCategories])

  function handleTabChange(tab: 'minha' | 'parceiro') {
    if (tab === activeTab) return
    setDirection(tab === 'parceiro' ? 'right' : 'left')
    setAnimating(true)
    setTimeout(() => {
      setActiveTab(tab)
      setAnimating(false)
    }, 150)
  }

  if (loading) return <Spinner />

  // filtros minha lista
  const myFiltered = myFilter
    ? myItems.filter(i => i.category_id === myFilter)
    : myItems
  const myUsedCatIds = new Set(myItems.map(i => i.category_id).filter(Boolean))
  const myUsedCats = myCategories.filter(c => myUsedCatIds.has(c.id))

  // filtros parceiro
  const hasFavorites = partnerItems.some(i => i.is_favorite)
  let partnerFiltered = partnerFilter
    ? partnerItems.filter(i => i.category_id === partnerFilter)
    : partnerItems
  if (showFavorites) {
    partnerFiltered = partnerFiltered.filter(i => i.is_favorite)
  }
  const partnerUsedCatIds = new Set(partnerItems.map(i => i.category_id).filter(Boolean))
  const partnerUsedCats = partnerCategories.filter(c => partnerUsedCatIds.has(c.id))

  const slideClass = animating
    ? (direction === 'right' ? styles.slideOutLeft : styles.slideOutRight)
    : styles.slideIn

  return (
    <>
      <TabNav partnerName={partnerName} activeTab={activeTab} onTabChange={handleTabChange} />

      <div className={`${styles.tabContent} ${slideClass}`}>
        {activeTab === 'minha' ? (
          <>
            <CategoryFilter
              categories={myUsedCats}
              selected={myFilter}
              onChange={setMyFilter}
            />
            <div style={{ marginTop: '12px' }}>
              <ItemList items={myFiltered} editable={true} categories={myCategories} onAdd={() => setShowForm(true)} onUpdate={loadMyData} />
            </div>
          </>
        ) : (
          <>
            {noPartner ? (
              <div className={styles.noPartner}>
                <p className={styles.noPartnerEmoji}>💌</p>
                <p className={styles.noPartnerText}>Seu parceiro(a) ainda nao entrou no app.</p>
                <p className={styles.noPartnerSub}>Quando ele(a) logar, a lista vai aparecer aqui!</p>
              </div>
            ) : (
              <>
                <CategoryFilter
                  categories={partnerUsedCats}
                  selected={partnerFilter}
                  onChange={(id) => {
                    setPartnerFilter(id)
                    setShowFavorites(false)
                  }}
                  extraFilters={hasFavorites ? [
                    {
                      label: '♥ Mais desejados',
                      active: showFavorites,
                      onClick: () => {
                        setShowFavorites(!showFavorites)
                        setPartnerFilter(null)
                      },
                    }
                  ] : undefined}
                />
                <div style={{ marginTop: '12px' }}>
                  <ItemList items={partnerFiltered} editable={false} onUpdate={loadPartnerData} />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {showForm && (
        <ItemForm
          categories={myCategories}
          onClose={() => setShowForm(false)}
          onManageCategories={() => {
            setShowForm(false)
            setShowCategories(true)
          }}
        />
      )}
      {showCategories && (
        <CategoryManager
          categories={myCategories}
          onClose={() => setShowCategories(false)}
          onBack={() => {
            setShowCategories(false)
            setShowForm(true)
          }}
        />
      )}
    </>
  )
}
