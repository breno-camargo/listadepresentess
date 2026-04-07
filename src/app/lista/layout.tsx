import { requireAuth, getPartnerEmail } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import TabNav from '@/components/TabNav'
import ThemeToggle from '@/components/ThemeToggle'

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
    <main style={{
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      padding: '16px',
      paddingBottom: '96px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <h1 style={{
          fontSize: '1.3rem',
          color: 'var(--color-primary)',
          fontWeight: 700,
        }}>
          Lista de Presentes
        </h1>
        <ThemeToggle />
      </div>
      <TabNav partnerName={partnerName} />
      <div style={{ marginTop: '16px' }}>
        {children}
      </div>
    </main>
  )
}
