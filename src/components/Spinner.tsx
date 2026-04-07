import styles from './Spinner.module.css'

export default function Spinner() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      <p className={styles.text}>Carregando...</p>
    </div>
  )
}
