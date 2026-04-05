'use client'

import styles from './Fab.module.css'

interface FabProps {
  onClick: () => void
}

export default function Fab({ onClick }: FabProps) {
  return (
    <button className={styles.fab} onClick={onClick} aria-label="Adicionar item">
      +
    </button>
  )
}
