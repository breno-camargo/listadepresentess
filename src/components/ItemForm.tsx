'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types'
import { createClient } from '@/lib/supabase-browser'
import Toast from './Toast'
import styles from './ItemForm.module.css'

interface ItemFormProps {
  categories: Category[]
  onClose: () => void
  onManageCategories: () => void
}

export default function ItemForm({ categories, onClose, onManageCategories }: ItemFormProps) {
  const [pending, setPending] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)

    const formData = new FormData(e.currentTarget)
    const name = (formData.get('name') as string)?.trim()
    const url = (formData.get('url') as string)?.trim() || null
    const categoryId = (formData.get('categoryId') as string) || null

    if (!name || name.length > 200) {
      setToast({ message: !name ? 'Nome é obrigatório' : 'Nome muito longo', type: 'error' })
      setPending(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('items').insert({
      user_id: user.id,
      name,
      url,
      category_id: categoryId || null,
      is_favorite: false,
      is_purchased: false,
    })

    setPending(false)
    if (error) {
      setToast({ message: 'Erro ao adicionar', type: 'error' })
      return
    }
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
