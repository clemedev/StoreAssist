import {
  useMemo,
} from 'react';

import {
  createDashboardSummary,
} from '../../lib/dashboard.js';

import {
  getExpenses,
  getProducts,
  getSales,
  getSettings,
} from '../../lib/store.js';

import styles from './Dashboard.module.css';

function formatRM(value) {
  return new Intl.NumberFormat(
    'en-MY',
    {
      style: 'currency',
      currency: 'MYR',
    },
  ).format(
    Number(value ?? 0),
  );
}

const PAYMENT_CARDS = [
  {
    id: 'cash',
    label: 'Cash',
    icon: '💵',
  },
  {
    id: 'qr',
    label: 'QR',
    icon: '▦',
  },
  {
    id: 'credit_card',
    label: 'Credit card',
    icon: '◈',
  },
  {
    id: 'debit_card',
    label: 'Debit card',
    icon: '▣',
  },
];

export default function Dashboard({
  refreshKey = 0,
}) {
  const summary = useMemo(
    () => {
      const settings =
        getSettings();

      return createDashboardSummary({
        sales: getSales(),
        expenses: getExpenses(),
        products: getProducts(),
        dailySalesTarget:
          settings.dailySalesTarget,
      });
    },
    [refreshKey],
  );

  const targetPercent =
    Math.round(
      summary.targetProgress *
        100,
    );

  const progressWidth =
    Math.min(
      100,
      Math.max(
        0,
        targetPercent,
      ),
    );

  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            Business overview
          </p>

          <h1>
            Welcome to StoreAssist
          </h1>

          <p className={styles.description}>
            Track today’s sales,
            operating costs, profit,
            stock, and customer
            payments.
          </p>
        </div>

        <span className={styles.live}>
          <i aria-hidden="true" />
          Local data
        </span>
      </header>

      <div className={styles.metrics}>
        <article className={styles.metric}>
          <span>Today’s sales</span>
          <strong>
            {formatRM(
              summary.totalSales,
            )}
          </strong>
          <small>
            {summary.unitsSold} units
            sold
          </small>
        </article>

        <article
          className={`${styles.metric} ${
            summary.netProfit >= 0
              ? styles.profit
              : styles.loss
          }`}
        >
          <span>Net profit</span>
          <strong>
            {formatRM(
              summary.netProfit,
            )}
          </strong>
          <small>
            After product costs and
            expenses
          </small>
        </article>

        <article className={styles.metric}>
          <span>Expenses</span>
          <strong>
            {formatRM(
              summary.expenseTotal,
            )}
          </strong>
          <small>
            Operating costs recorded
          </small>
        </article>

        <article className={styles.metric}>
          <span>Transactions</span>
          <strong>
            {summary.transactionCount}
          </strong>
          <small>
            Confirmed sales
          </small>
        </article>
      </div>

      <div className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.eyebrow}>
                Sales target
              </p>

              <h2>
                Daily progress
              </h2>
            </div>

            <strong>
              {targetPercent}%
            </strong>
          </div>

          <div
            className={styles.progress}
            role="progressbar"
            aria-label="Daily sales target progress"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={
              progressWidth
            }
          >
            <span
              style={{
                width:
                  `${progressWidth}%`,
              }}
            />
          </div>

          <p className={styles.note}>
            {formatRM(
              summary.totalSales,
            )}{' '}
            recorded today
          </p>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.eyebrow}>
                Customer payments
              </p>

              <h2>
                Payment breakdown
              </h2>
            </div>
          </div>

          <div className={styles.payments}>
            {PAYMENT_CARDS.map(
              (method) => (
                <div
                  key={method.id}
                  className={
                    styles.payment
                  }
                >
                  <span
                    className={
                      styles.paymentIcon
                    }
                    aria-hidden="true"
                  >
                    {method.icon}
                  </span>

                  <div>
                    <small>
                      {method.label}
                    </small>

                    <strong>
                      {formatRM(
                        summary
                          .paymentSplit[
                          method.id
                        ],
                      )}
                    </strong>
                  </div>
                </div>
              ),
            )}
          </div>
        </article>
      </div>

      <div className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.eyebrow}>
                Best sellers
              </p>

              <h2>
                Top products
              </h2>
            </div>
          </div>

          {summary.topProducts.length ===
          0 ? (
            <p className={styles.empty}>
              No sales recorded yet.
            </p>
          ) : (
            <ol className={styles.list}>
              {summary.topProducts.map(
                (product) => (
                  <li
                    key={
                      product.productId ??
                      product.name
                    }
                  >
                    <span>
                      {product.name}
                    </span>

                    <strong>
                      {product.quantity}{' '}
                      units
                    </strong>
                  </li>
                ),
              )}
            </ol>
          )}
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.eyebrow}>
                Inventory attention
              </p>

              <h2>
                Low stock
              </h2>
            </div>

            <strong>
              {
                summary
                  .lowStockProducts
                  .length
              }
            </strong>
          </div>

          {summary.lowStockProducts
            .length === 0 ? (
            <p className={styles.empty}>
              All products are above
              their warning levels.
            </p>
          ) : (
            <ul className={styles.list}>
              {summary.lowStockProducts.map(
                (product) => (
                  <li key={product.id}>
                    <span>
                      {product.name}
                    </span>

                    <strong>
                      {
                        product.currentStock
                      }{' '}
                      left
                    </strong>
                  </li>
                ),
              )}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
}
