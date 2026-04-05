import LoginButton from '@/components/LoginButton'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      padding: '20px',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: '2rem',
        color: 'var(--color-primary)',
        marginBottom: '8px',
      }}>
        Lista de Presentes
      </h1>
      <p style={{
        color: 'var(--color-text-light)',
        marginBottom: '32px',
        fontSize: '1.1rem',
      }}>
        Wishlist de casal
      </p>
      {searchParams.error === 'nao-autorizado' && (
        <p style={{
          color: '#EF4444',
          marginBottom: '16px',
          fontSize: '0.9rem',
        }}>
          Esse email nao tem acesso. Use o email autorizado.
        </p>
      )}
      <LoginButton />
    </main>
  )
}
