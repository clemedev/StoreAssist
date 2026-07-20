import styles from './App.module.css';

export default function App() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div
          className={styles.logo}
          aria-hidden="true"
        >
          SA
        </div>

        <p className={styles.eyebrow}>
          Smart business workspace
        </p>

        <h1>StoreAssist</h1>

        <p className={styles.description}>
          Manage sales, expenses, inventory,
          and customer payments from one
          straightforward workspace.
        </p>

        <div className={styles.paymentMethods}>
          <span>Cash</span>
          <span>QR</span>
          <span>Credit card</span>
          <span>Debit card</span>
        </div>
      </section>
    </main>
  );
}
