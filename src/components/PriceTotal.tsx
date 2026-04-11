'use client'

import { Item } from '@/types'
import styles from './PriceTotal.module.css'

interface PriceTotalProps {
  items: Item[]
}

export default function PriceTotal({ items }: PriceTotalProps) {
  const itemsWithPrice = items.filter(i => i.price)
  if (itemsWithPrice.length === 0) return null

  const pending = items.filter(i => !i.is_purchased && i.price)
  const purchased = items.filter(i => i.is_purchased && i.price)
  const totalPending = pending.reduce((sum, i) => sum + (Number(i.price) || 0), 0)
  const totalPurchased = purchased.reduce((sum, i) => sum + (Number(i.price) || 0), 0)

  const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <span>Pendente:</span>
        <span className={styles.value}>R$ {fmt(totalPending)}</span>
      </div>
      {totalPurchased > 0 && (
        <>
          <div className={styles.separator} />
          <div className={styles.item}>
            <span>Comprado:</span>
            <span className={styles.purchased}>R$ {fmt(totalPurchased)}</span>
          </div>
        </>
      )}
    </div>
  )
}
