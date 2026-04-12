'use client'

import { Category } from '@/types'
import styles from './CategoryFilter.module.css'

interface ExtraFilter {
  label: string
  active: boolean
  onClick: () => void
}

interface CategoryFilterProps {
  categories: Category[]
  selected: string | null
  onChange: (categoryId: string | null) => void
  extraFilters?: ExtraFilter[]
}

export default function CategoryFilter({ categories, selected, onChange, extraFilters }: CategoryFilterProps) {
  const hasAnything = categories.length > 0 || (extraFilters && extraFilters.length > 0)
  if (!hasAnything) return null

  const noExtraActive = !extraFilters?.some(f => f.active)

  return (
    <div className={styles.container}>
      <button
        className={`${styles.chip} ${selected === null && noExtraActive ? styles.active : ''}`}
        onClick={() => onChange(null)}
      >
        <span>Todos</span>
      </button>
      {extraFilters?.map(filter => (
        <button
          key={filter.label}
          className={`${styles.chip} ${styles.special} ${filter.active ? styles.activeSpecial : ''}`}
          onClick={filter.onClick}
        >
          <span>{filter.label}</span>
        </button>
      ))}
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`${styles.chip} ${selected === cat.id ? styles.active : ''}`}
          onClick={() => onChange(cat.id)}
        >
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  )
}
