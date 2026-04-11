'use client'

import { useState } from 'react'
import { Item, Category } from '@/types'
import { createClient } from '@/lib/supabase-browser'
import EditItemForm from './EditItemForm'
import Toast from './Toast'
import styles from './ItemCard.module.css'

interface ItemCardProps {
  item: Item
  editable: boolean
  categories?: Category[]
  onUpdate?: () => void
}

export default function ItemCard({ item, editable, categories, onUpdate }: ItemCardProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const supabase = createClient()
  const cardClass = `${styles.card} ${item.is_favorite ? styles.favorite : ''} ${item.is_purchased ? styles.purchased : ''}`

  async function handleFavorite() {
    const { error } = await supabase.from('items').update({ is_favorite: !item.is_favorite }).eq('id', item.id)
    if (error) {
      setToast({ message: 'Erro ao favoritar', type: 'error' })
      return
    }
    onUpdate?.()
  }

  async function handlePurchased() {
    const { error } = await supabase.from('items').update({ is_purchased: !item.is_purchased }).eq('id', item.id)
    if (error) {
      setToast({ message: 'Erro ao atualizar', type: 'error' })
      return
    }
    setToast({ message: item.is_purchased ? 'Desmarcado' : 'Marcado como comprado!', type: 'success' })
    onUpdate?.()
  }

  async function handleDelete() {
    const { error } = await supabase.from('items').delete().eq('id', item.id)
    if (error) {
      setToast({ message: 'Erro ao remover', type: 'error' })
      return
    }
    onUpdate?.()
  }

  return (
    <>
      <div className={cardClass}>
        <div className={styles.row}>
          {editable && (
            <button
              className={`${styles.checkbox} ${item.is_purchased ? styles.checked : ''}`}
              onClick={handlePurchased}
              aria-label={item.is_purchased ? 'Desmarcar comprado' : 'Marcar como comprado'}
            >
              {item.is_purchased && <span className={styles.checkmark}>✓</span>}
            </button>
          )}
          {!editable && (
            <div className={`${styles.checkbox} ${item.is_purchased ? styles.checked : ''} ${styles.checkboxReadonly}`}>
              {item.is_purchased && <span className={styles.checkmark}>✓</span>}
            </div>
          )}
          <div className={styles.content}>
            <div className={styles.header}>
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.nameWrap}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.domain}>
                    {(() => { try { return new URL(item.url).hostname.replace('www.', '') } catch { return '' } })()}
                  </span>
                </a>
              ) : (
                <div className={styles.nameWrap}>
                  <span className={styles.name}>{item.name}</span>
                </div>
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
            <div className={styles.meta}>
              {item.price && (
                <span className={styles.price}>
                  R$ {Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
              {item.category && (
                <span className={styles.categoryChip}>{item.category.name}</span>
              )}
            </div>
          </div>
        </div>
        {editable && (
          <div className={styles.actions}>
            <button
              className={styles.editBtn}
              onClick={() => setEditing(true)}
            >
              Editar
            </button>
            {confirmDelete ? (
              <>
                <button
                  className={styles.cancelDeleteBtn}
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </button>
                <button
                  className={styles.confirmDeleteBtn}
                  onClick={handleDelete}
                >
                  Deletar
                </button>
              </>
            ) : (
              <button
                className={styles.deleteBtn}
                onClick={() => setConfirmDelete(true)}
                aria-label="Remover item"
              >
                ✕
              </button>
            )}
          </div>
        )}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
      {editing && categories && (
        <EditItemForm
          item={item}
          categories={categories}
          onClose={() => setEditing(false)}
          onSave={() => onUpdate?.()}
        />
      )}
    </>
  )
}
