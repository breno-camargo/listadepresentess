'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import styles from './LogoutButton.module.css'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button className={styles.button} onClick={handleLogout} aria-label="Sair">
      Sair
    </button>
  )
}
