import {
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';

import {
  archiveStoredProduct,
  clearStoreAssistData,
  deleteExpense,
  deleteSale,
  getExpenses,
  getProducts,
  getSales,
  getSettings,
  saveExpense,
  saveProduct,
  saveSale,
  saveSettings,
  STORAGE_KEYS,
} from './store.js';

describe(
  'StoreAssist local data store',
  () => {
    beforeEach(() => {
      clearStoreAssistData();
    });

    test(
      'uses isolated StoreAssist storage keys',
      () => {
        expect(STORAGE_KEYS).toEqual({
          products:
            'storeassist.products',
          sales:
            'storeassist.sales',
          expenses:
            'storeassist.expenses',
          settings:
            'storeassist.settings',
        });

        expect(
          Object.values(
            STORAGE_KEYS,
          ).every(
            (key) =>
              key.startsWith(
                'storeassist.',
              ),
          ),
        ).toBe(true);
      },
    );

    test(
      'saves and updates a product',
      () => {
        const product =
          saveProduct({
            id: 'product-1',
            name: 'Mineral Water',
            sellingPrice: 2.5,
            costPrice: 1,
            currentStock: 20,
            lowStockThreshold: 5,
            createdAt:
              '2026-07-20T10:00:00.000Z',
          });

        expect(
          getProducts(),
        ).toHaveLength(1);

        const updated =
          saveProduct({
            ...product,
            sellingPrice: 3,
          });

        expect(
          getProducts(),
        ).toHaveLength(1);

        expect(
          updated.sellingPrice,
        ).toBe(3);

        expect(
          updated.profitPerUnit,
        ).toBe(2);
      },
    );

    test(
      'archives a product without deleting its history',
      () => {
        saveProduct({
          id: 'product-2',
          name: 'Notebook',
          sellingPrice: 6.9,
          costPrice: 3.4,
          currentStock: 10,
          lowStockThreshold: 3,
        });

        archiveStoredProduct(
          'product-2',
        );

        expect(
          getProducts(),
        ).toHaveLength(0);

        expect(
          getProducts({
            includeArchived: true,
          }),
        ).toHaveLength(1);

        expect(
          getProducts({
            includeArchived: true,
          })[0].isActive,
        ).toBe(false);
      },
    );

    test.each([
      'cash',
      'qr',
      'credit_card',
      'debit_card',
    ])(
      'saves a %s sale and reduces stock',
      (paymentMethod) => {
        const product =
          saveProduct({
            id:
              `product-${paymentMethod}`,
            name:
              `Product ${paymentMethod}`,
            sellingPrice: 10,
            costPrice: 6,
            currentStock: 10,
            lowStockThreshold: 3,
          });

        const sale = saveSale({
          id:
            `sale-${paymentMethod}`,
          productId:
            product.id,
          quantity: 2,
          paymentMethod,
          source: 'manual',
          date: '2026-07-20',
          createdAt:
            '2026-07-20T11:00:00.000Z',
        });

        expect(
          sale.paymentMethod,
        ).toBe(paymentMethod);

        expect(
          sale.totalRevenue,
        ).toBe(20);

        expect(
          sale.totalCost,
        ).toBe(12);

        expect(
          sale.grossProfit,
        ).toBe(8);

        expect(
          getProducts()[0]
            .currentStock,
        ).toBe(8);
      },
    );

    test(
      'deleting a sale restores its stock',
      () => {
        const product =
          saveProduct({
            id: 'product-restore',
            name: 'USB Cable',
            sellingPrice: 12,
            costPrice: 7,
            currentStock: 5,
            lowStockThreshold: 2,
          });

        saveSale({
          id: 'sale-restore',
          productId: product.id,
          quantity: 3,
          paymentMethod:
            'debit_card',
          source: 'manual',
          date: '2026-07-20',
          createdAt:
            '2026-07-20T12:00:00.000Z',
        });

        expect(
          getProducts()[0]
            .currentStock,
        ).toBe(2);

        deleteSale(
          'sale-restore',
        );

        expect(
          getSales(),
        ).toHaveLength(0);

        expect(
          getProducts()[0]
            .currentStock,
        ).toBe(5);
      },
    );

    test(
      'prevents a sale above available stock',
      () => {
        const product =
          saveProduct({
            id: 'product-low-stock',
            name: 'Batteries',
            sellingPrice: 8,
            costPrice: 4.5,
            currentStock: 2,
            lowStockThreshold: 1,
          });

        expect(() =>
          saveSale({
            productId:
              product.id,
            quantity: 3,
            paymentMethod:
              'credit_card',
            date: '2026-07-20',
          }),
        ).toThrow(
          'There is not enough stock for this sale.',
        );

        expect(
          getSales(),
        ).toHaveLength(0);

        expect(
          getProducts()[0]
            .currentStock,
        ).toBe(2);
      },
    );

    test(
      'saves and deletes an expense',
      () => {
        const expense =
          saveExpense({
            id: 'expense-1',
            category: 'inventory',
            amount: 75.5,
            note: 'Stock purchase',
            date: '2026-07-20',
            source: 'receipt',
            createdAt:
              '2026-07-20T13:00:00.000Z',
            updatedAt:
              '2026-07-20T13:00:00.000Z',
          });

        expect(
          getExpenses(),
        ).toHaveLength(1);

        expect(
          expense.source,
        ).toBe('receipt');

        deleteExpense(
          expense.id,
        );

        expect(
          getExpenses(),
        ).toHaveLength(0);
      },
    );

    test(
      'returns and updates settings',
      () => {
        expect(
          getSettings(),
        ).toEqual({
          dailySalesTarget: 500,
          lowStockEnabled: true,
        });

        saveSettings({
          dailySalesTarget: 750,
        });

        expect(
          getSettings(),
        ).toEqual({
          dailySalesTarget: 750,
          lowStockEnabled: true,
        });
      },
    );

    test(
      'clears all StoreAssist data',
      () => {
        saveProduct({
          id: 'product-clear',
          name: 'Tissue Pack',
          sellingPrice: 4,
          costPrice: 2,
          currentStock: 10,
          lowStockThreshold: 3,
        });

        saveExpense({
          id: 'expense-clear',
          category: 'utilities',
          amount: 30,
          date: '2026-07-20',
        });

        saveSettings({
          dailySalesTarget: 900,
        });

        clearStoreAssistData();

        expect(
          getProducts(),
        ).toEqual([]);

        expect(
          getSales(),
        ).toEqual([]);

        expect(
          getExpenses(),
        ).toEqual([]);

        expect(
          getSettings(),
        ).toEqual({
          dailySalesTarget: 500,
          lowStockEnabled: true,
        });
      },
    );
  },
);
