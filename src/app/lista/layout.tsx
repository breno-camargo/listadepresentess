import { requireAuth, getPartnerEmail } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import ThemeToggle from '@/components/ThemeToggle'
import ListaTabs from '@/components/ListaTabs'
import styles from './layout.module.css'

export default async function ListaLayout() {
  const user = await requireAuth()
  const supabase = await createClient()
  const partnerEmail = await getPartnerEmail(user.email!)

  let partnerName = 'Parceiro(a)'
  if (partnerEmail) {
    const { data: partner } = await supabase
      .from('profiles')
      .select('name')
      .eq('email', partnerEmail)
      .single()
    if (partner?.name) {
      partnerName = partner.name.split(' ')[0]
    }
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎁 Lista de Presentes</h1>
        <ThemeToggle />
      </header>
      <ListaTabs partnerName={partnerName} />
    </main>
  )
}
