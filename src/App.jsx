import {
  useState,
} from 'react';

import Dashboard from './components/Dashboard/Dashboard.jsx';

import {
  seedDemoData,
} from './lib/demoData.js';

import {
  clearStoreAssistData,
} from './lib/store.js';

import styles from './App.module.css';

export default function App() {
  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0);

  function refreshDashboard() {
    setRefreshKey(
      (current) =>
        current + 1,
    );
  }

  function handleLoadDemo() {
    seedDemoData({
      dayCount: 14,
    });

    refreshDashboard();
  }

  function handleClearData() {
    clearStoreAssistData();
    refreshDashboard();
  }

  return (
    <div className={styles.application}>
      <header className={styles.topbar}>
        <a className={styles.brand} href="/">
          <span
            className={styles.brandMark}
            aria-hidden="true"
          >
            SA
          </span>

          <span>
            <strong>
              StoreAssist
            </strong>

            <small>
              Smart business assistant
            </small>
          </span>
        </a>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleClearData}
          >
            Clear data
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleLoadDemo}
          >
            Load demo data
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <Dashboard
          refreshKey={refreshKey}
        />
      </main>
    </div>
  );
}
