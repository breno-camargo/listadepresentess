import { Item } from '@/types'
import ItemCard from './ItemCard'
import styles from './ItemList.module.css'

interface ItemListProps {
  items: Item[]
  editable: boolean
}

export default function ItemList({ items, editable }: ItemListProps) {
  const active = items.filter(i => !i.is_purchased)
  const purchased = items.filter(i => i.is_purchased)

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>{editable ? 'Sua lista esta vazia. Adicione um presente!' : 'Nenhum item na lista ainda.'}</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {active.map(item => (
        <ItemCard key={item.id} item={item} editable={editable} />
      ))}
      {purchased.length > 0 && (
        <>
          <p className={styles.sectionTitle}>Comprados</p>
          {purchased.map(item => (
            <ItemCard key={item.id} item={item} editable={editable} />
          ))}
        </>
      )}
    </div>
  )
}
