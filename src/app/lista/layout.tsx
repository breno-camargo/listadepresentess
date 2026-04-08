import { requireAuth, getPartnerEmail } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import TabNav from '@/components/TabNav'
import ThemeToggle from '@/components/ThemeToggle'
import styles from './layout.module.css'

export default async function ListaLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
      <TabNav partnerName={partnerName} />
      <div className={styles.content}>
        {children}
      </div>
    </main>
  )
}
