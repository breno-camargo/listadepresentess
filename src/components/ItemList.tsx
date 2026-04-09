import { Item, Category } from '@/types'
import ItemCard from './ItemCard'
import styles from './ItemList.module.css'

interface ItemListProps {
  items: Item[]
  editable: boolean
  categories?: Category[]
  onAdd?: () => void
  onUpdate?: () => void
}

export default function ItemList({ items, editable, categories, onAdd, onUpdate }: ItemListProps) {
  const active = items.filter(i => !i.is_purchased)
  const purchased = items.filter(i => i.is_purchased)

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>{editable ? 'Sua lista esta vazia.' : 'Nenhum item na lista ainda.'}</p>
        {editable && onAdd && (
          <button className={styles.addBtn} onClick={onAdd}>
            + Adicionar presente
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {active.map(item => (
        <ItemCard key={item.id} item={item} editable={editable} categories={categories} onUpdate={onUpdate} />
      ))}
      {editable && onAdd && (
        <button className={styles.addBtn} onClick={onAdd}>
          + Adicionar presente
        </button>
      )}
      {purchased.length > 0 && (
        <>
          <p className={styles.sectionTitle}>Comprados</p>
          {purchased.map(item => (
            <ItemCard key={item.id} item={item} editable={editable} categories={categories} onUpdate={onUpdate} />
          ))}
        </>
      )}
    </div>
  )
}
