'use client'

import { useState } from 'react'
import { Category } from '@/types'
import { addItem } from '@/lib/actions'
import styles from './ItemForm.module.css'

interface ItemFormProps {
  categories: Category[]
  onClose: () => void
  onManageCategories: () => void
}

export default function ItemForm({ categories, onClose, onManageCategories }: ItemFormProps) {
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const formData = new FormData(e.currentTarget)
    await addItem(formData)
    setPending(false)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <form
        className={styles.form}
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className={styles.title}>Novo item</h2>

        <label className={styles.label}>
          Nome do produto *
          <input
            name="name"
            type="text"
            required
            placeholder="Ex: Fone Bluetooth"
            className={styles.input}
            autoFocus
          />
        </label>

        <label className={styles.label}>
          Link (opcional)
          <input
            name="url"
            type="url"
            placeholder="https://..."
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Categoria (opcional)
          <div className={styles.categoryRow}>
            <select name="categoryId" className={styles.select}>
              <option value="">Sem categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button type="button" className={styles.manageBtn} onClick={onManageCategories}>
              Editar
            </button>
          </div>
        </label>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.submitBtn} disabled={pending}>
            {pending ? 'Salvando...' : 'Adicionar'}
          </button>
        </div>
      </form>
    </div>
  )
}
