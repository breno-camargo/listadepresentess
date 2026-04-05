'use client'

import { Item } from '@/types'
import { toggleFavorite, togglePurchased, deleteItem } from '@/lib/actions'
import styles from './ItemCard.module.css'

interface ItemCardProps {
  item: Item
  editable: boolean
}

export default function ItemCard({ item, editable }: ItemCardProps) {
  const cardClass = `${styles.card} ${item.is_favorite ? styles.favorite : ''} ${item.is_purchased ? styles.purchased : ''}`

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
              onClick={() => toggleFavorite(item.id, !item.is_favorite)}
              aria-label={item.is_favorite ? 'Remover favorito' : 'Favoritar'}
            >
              {item.is_favorite ? '♥' : '♡'}
            </button>
          )}
          {!editable && item.is_favorite && (
            <span className={styles.favoriteIcon}>♥</span>
          )}
        </div>
        {item.category && (
          <span className={styles.categoryChip}>{item.category.name}</span>
        )}
      </div>
      {editable && (
        <div className={styles.actions}>
          <button
            className={styles.purchasedBtn}
            onClick={() => togglePurchased(item.id, !item.is_purchased)}
          >
            {item.is_purchased ? 'Desmarcar' : 'Comprado'}
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => deleteItem(item.id)}
            aria-label="Remover item"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
