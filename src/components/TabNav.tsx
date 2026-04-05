'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './TabNav.module.css'

interface TabNavProps {
  partnerName: string
}

export default function TabNav({ partnerName }: TabNavProps) {
  const pathname = usePathname()

  return (
    <nav className={styles.nav}>
      <Link
        href="/lista/minha"
        className={`${styles.tab} ${pathname === '/lista/minha' ? styles.active : ''}`}
      >
        Minha Lista
      </Link>
      <Link
        href="/lista/parceiro"
        className={`${styles.tab} ${pathname === '/lista/parceiro' ? styles.active : ''}`}
      >
        Lista de {partnerName}
      </Link>
    </nav>
  )
}
