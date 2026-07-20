import {
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';

import {
  DEMO_PRODUCTS,
  seedDemoData,
} from './demoData.js';

import {
  clearStoreAssistData,
  getExpenses,
  getProducts,
  getSales,
  getSettings,
  STORAGE_KEYS,
} from './store.js';

describe(
  'StoreAssist retail demo data',
  () => {
    beforeEach(() => {
      clearStoreAssistData();
    });

    test(
      'defines eight retail products',
      () => {
        expect(
          DEMO_PRODUCTS,
        ).toHaveLength(8);

        expect(
          DEMO_PRODUCTS.map(
            (product) =>
              product.name,
          ),
        ).toEqual([
          'Mineral Water',
          'Instant Noodles',
          'Sandwich Bread',
          'Coffee Sachets',
          'Tissue Pack',
          'AA Batteries',
          'USB-C Cable',
          'Reusable Bag',
        ]);
      },
    );

    test(
      'seeds products and settings',
      () => {
        const result =
          seedDemoData({
            dayCount: 14,
          });

        expect(
          result.dates,
        ).toHaveLength(14);

        expect(
          getProducts(),
        ).toHaveLength(8);

        expect(
          getSettings(),
        ).toEqual({
          dailySalesTarget: 180,
          lowStockEnabled: true,
        });
      },
    );

    test(
      'creates sales across all four payment methods',
      () => {
        seedDemoData({
          dayCount: 14,
        });

        const sales =
          getSales();

        const methods =
          new Set(
            sales.map(
              (sale) =>
                sale.paymentMethod,
            ),
          );

        expect(
          methods,
        ).toEqual(
          new Set([
            'cash',
            'qr',
            'credit_card',
            'debit_card',
          ]),
        );

        expect(
          sales.length,
        ).toBeGreaterThan(30);
      },
    );

    test(
      'creates valid financial sales records',
      () => {
        seedDemoData({
          dayCount: 14,
        });

        for (
          const sale of
          getSales()
        ) {
          expect(
            sale.totalRevenue,
          ).toBeGreaterThan(0);

          expect(
            sale.totalCost,
          ).toBeGreaterThanOrEqual(0);

          expect(
            sale.grossProfit,
          ).toBe(
            Math.round(
              (
                sale.totalRevenue -
                sale.totalCost +
                Number.EPSILON
              ) * 100,
            ) / 100,
          );
        }
      },
    );

    test(
      'creates realistic operating expenses',
      () => {
        seedDemoData({
          dayCount: 14,
        });

        const expenses =
          getExpenses();

        expect(
          expenses,
        ).toHaveLength(5);

        expect(
          expenses.map(
            (expense) =>
              expense.category,
          ),
        ).toEqual(
          expect.arrayContaining([
            'inventory',
            'transport',
            'packaging',
            'utilities',
            'marketing',
          ]),
        );

        expect(
          expenses.some(
            (expense) =>
              expense.source ===
              'receipt',
          ),
        ).toBe(true);
      },
    );

    test(
      'reduces stock after demo sales',
      () => {
        seedDemoData({
          dayCount: 14,
        });

        const storedProducts =
          getProducts();

        expect(
          storedProducts.some(
            (product) => {
              const original =
                DEMO_PRODUCTS.find(
                  (item) =>
                    item.id ===
                    product.id,
                );

              return (
                original &&
                product.currentStock <
                  original.currentStock
              );
            },
          ),
        ).toBe(true);

        expect(
          storedProducts.every(
            (product) =>
              product.currentStock >=
              0,
          ),
        ).toBe(true);
      },
    );

    test(
      'uses only isolated StoreAssist keys',
      () => {
        seedDemoData({
          dayCount: 3,
        });

        for (
          const key of
          Object.values(
            STORAGE_KEYS,
          )
        ) {
          expect(
            key.startsWith(
              'storeassist.',
            ),
          ).toBe(true);

          expect(
            localStorage.getItem(
              key,
            ),
          ).not.toBeNull();
        }

        expect(
          localStorage.getItem(
            'warungai.products',
          ),
        ).toBeNull();

        expect(
          localStorage.getItem(
            'warungai.sales',
          ),
        ).toBeNull();
      },
    );

    test(
      'replaces previous demo data when seeded again',
      () => {
        seedDemoData({
          dayCount: 3,
        });

        const firstSalesCount =
          getSales().length;

        seedDemoData({
          dayCount: 3,
        });

        expect(
          getProducts(),
        ).toHaveLength(8);

        expect(
          getExpenses(),
        ).toHaveLength(5);

        expect(
          getSales().length,
        ).toBe(
          firstSalesCount,
        );
      },
    );
  },
);
