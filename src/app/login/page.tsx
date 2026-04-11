import LoginButton from '@/components/LoginButton'
import styles from './page.module.css'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <span className={styles.emoji}>🎁</span>
        <h1 className={styles.title}>Lista de Presentes</h1>
        <p className={styles.subtitle}>Wishlist de casal</p>
        {searchParams.error && (
          <p className={styles.error}>
            {searchParams.error === 'nao-autorizado'
              ? 'Esse email nao tem acesso. Use o email autorizado.'
              : `Erro: ${searchParams.error}`}
          </p>
        )}
        <LoginButton />
      </div>
    </main>
  )
}
