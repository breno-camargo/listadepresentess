'use client'

import { Category } from '@/types'
import styles from './CategoryFilter.module.css'

interface CategoryFilterProps {
  categories: Category[]
  selected: string | null
  onChange: (categoryId: string | null) => void
}

export default function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  if (categories.length === 0) return null

  return (
    <div className={styles.container}>
      <button
        className={`${styles.chip} ${selected === null ? styles.active : ''}`}
        onClick={() => onChange(null)}
      >
        Todos
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`${styles.chip} ${selected === cat.id ? styles.active : ''}`}
          onClick={() => onChange(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
