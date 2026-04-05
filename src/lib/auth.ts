import { createClient } from './supabase-server'
import { redirect } from 'next/navigation'

const AUTHORIZED_EMAILS = (process.env.AUTHORIZED_EMAILS ?? '').split(',').map(e => e.trim())

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/login')
  if (!AUTHORIZED_EMAILS.includes(user.email ?? '')) {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login?error=nao-autorizado')
  }
  return user
}

export async function getPartnerEmail(currentEmail: string) {
  const partner = AUTHORIZED_EMAILS.find(e => e !== currentEmail)
  return partner ?? null
}
