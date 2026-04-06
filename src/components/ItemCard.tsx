'use client'

import { Item } from '@/types'
import { createClient } from '@/lib/supabase-browser'
import styles from './ItemCard.module.css'

interface ItemCardProps {
  item: Item
  editable: boolean
  onUpdate?: () => void
}

export default function ItemCard({ item, editable, onUpdate }: ItemCardProps) {
  const supabase = createClient()
  const cardClass = `${styles.card} ${item.is_favorite ? styles.favorite : ''} ${item.is_purchased ? styles.purchased : ''}`

  async function handleFavorite() {
    await supabase.from('items').update({ is_favorite: !item.is_favorite }).eq('id', item.id)
    onUpdate?.()
  }

  async function handlePurchased() {
    await supabase.from('items').update({ is_purchased: !item.is_purchased }).eq('id', item.id)
    onUpdate?.()
  }

  async function handleDelete() {
    await supabase.from('items').delete().eq('id', item.id)
    onUpdate?.()
  }

  return (
    <div className={cardClass}>
      <div className={styles.content}>
        <div className={styles.header}>
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.name}>
              {item.name}
            </a>
          ) : (
            <span className={styles.name}>{item.name}</span>
          )}
          {editable && (
            <button
              className={styles.favoriteBtn}
              onClick={handleFavorite}
              aria-label={item.is_favorite ? 'Remover favorito' : 'Favoritar'}
            >
              {item.is_favorite ? '♥' : '♡'}
            </button>
          )}
          {!editable && item.is_favorite && (
            <span className={styles.favoriteIcon}>♥</span>
          )}
        </div>
        {item.is_purchased && (
          <span className={styles.purchasedBadge}>✓ Comprado</span>
        )}
        {item.category && (
          <span className={styles.categoryChip}>{item.category.name}</span>
        )}
      </div>
      {editable && (
        <div className={styles.actions}>
          <button
            className={styles.purchasedBtn}
            onClick={handlePurchased}
          >
            {item.is_purchased ? 'Desmarcar' : 'Comprado'}
          </button>
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            aria-label="Remover item"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
