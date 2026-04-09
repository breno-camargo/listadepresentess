'use client'

import styles from './TabNav.module.css'

interface TabNavProps {
  partnerName: string
  activeTab: 'minha' | 'parceiro'
  onTabChange: (tab: 'minha' | 'parceiro') => void
}

export default function TabNav({ partnerName, activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className={styles.nav}>
      <button
        className={`${styles.tab} ${activeTab === 'minha' ? styles.active : ''}`}
        onClick={() => onTabChange('minha')}
      >
        Minha Lista
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'parceiro' ? styles.active : ''}`}
        onClick={() => onTabChange('parceiro')}
      >
        Lista de {partnerName}
      </button>
    </nav>
  )
}
