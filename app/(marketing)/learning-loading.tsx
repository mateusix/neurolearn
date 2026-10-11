import styles from './learning-loading.module.css';

export default function LearningLoading() {
  return <div className={styles.loading} role="status" aria-live="polite">
    <span className={styles.spinner} aria-hidden="true" />
    <strong>Preparando sua aprendizagem…</strong>
    <span>Estamos organizando suas descobertas.</span>
  </div>;
}
