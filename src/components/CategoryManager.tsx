'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types'
import { addCategory, deleteCategory } from '@/lib/actions'
import styles from './CategoryManager.module.css'

interface CategoryManagerProps {
  categories: Category[]
  onClose: () => void
}

export default function CategoryManager({ categories, onClose }: CategoryManagerProps) {
  const [name, setName] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  async function handleAdd() {
    if (!name.trim()) return
    setPending(true)
    await addCategory(name.trim())
    setName('')
    setPending(false)
  }

  async function handleDelete(id: string) {
    await deleteCategory(id)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Categorias</h2>

        <div className={styles.addRow}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nova categoria..."
            className={styles.input}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} disabled={pending} className={styles.addBtn}>
            +
          </button>
        </div>

        <ul className={styles.list}>
          {categories.map(cat => (
            <li key={cat.id} className={styles.item}>
              <span>{cat.name}</span>
              <button
                onClick={() => handleDelete(cat.id)}
                className={styles.deleteBtn}
                aria-label={`Remover ${cat.name}`}
              >
                ✕
              </button>
            </li>
          ))}
          {categories.length === 0 && (
            <li className={styles.empty}>Nenhuma categoria ainda</li>
          )}
        </ul>

        <button onClick={onClose} className={styles.closeBtn}>
          Fechar
        </button>
      </div>
    </div>
  )
}
