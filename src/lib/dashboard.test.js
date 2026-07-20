import {
  describe,
  expect,
  test,
} from 'vitest';

import {
  calculatePaymentSplit,
  calculateTopProducts,
  createDashboardSummary,
  getLowStockProducts,
} from './dashboard.js';

const sales = [
  {
    id: 'sale-1',
    productId: 'water',
    productName: 'Mineral Water',
    quantity: 3,
    totalRevenue: 7.5,
    totalCost: 3,
    grossProfit: 4.5,
    paymentMethod: 'cash',
  },
  {
    id: 'sale-2',
    productId: 'notebook',
    productName: 'Notebook',
    quantity: 2,
    totalRevenue: 13.8,
    totalCost: 6.8,
    grossProfit: 7,
    paymentMethod: 'qr',
  },
  {
    id: 'sale-3',
    productId: 'water',
    productName: 'Mineral Water',
    quantity: 2,
    totalRevenue: 5,
    totalCost: 2,
    grossProfit: 3,
    paymentMethod: 'credit_card',
  },
  {
    id: 'sale-4',
    productId: 'cable',
    productName: 'USB Cable',
    quantity: 1,
    totalRevenue: 12,
    totalCost: 7,
    grossProfit: 5,
    paymentMethod: 'debit_card',
  },
];

const expenses = [
  {
    id: 'expense-1',
    category: 'inventory',
    amount: 5,
  },
  {
    id: 'expense-2',
    category: 'transport',
    amount: 2.5,
  },
];

const products = [
  {
    id: 'water',
    name: 'Mineral Water',
    currentStock: 10,
    lowStockThreshold: 5,
    isActive: true,
  },
  {
    id: 'notebook',
    name: 'Notebook',
    currentStock: 3,
    lowStockThreshold: 3,
    isActive: true,
  },
  {
    id: 'cable',
    name: 'USB Cable',
    currentStock: 1,
    lowStockThreshold: 4,
    isActive: true,
  },
  {
    id: 'archived',
    name: 'Archived Product',
    currentStock: 0,
    lowStockThreshold: 5,
    isActive: false,
  },
];

describe(
  'StoreAssist dashboard calculations',
  () => {
    test(
      'calculates all financial totals',
      () => {
        const summary =
          createDashboardSummary({
            sales,
            expenses,
            products,
            dailySalesTarget: 100,
          });

        expect(
          summary.totalSales,
        ).toBe(38.3);

        expect(
          summary.totalCost,
        ).toBe(18.8);

        expect(
          summary.grossProfit,
        ).toBe(19.5);

        expect(
          summary.expenseTotal,
        ).toBe(7.5);

        expect(
          summary.netProfit,
        ).toBe(12);
      },
    );

    test(
      'counts transactions and units sold',
      () => {
        const summary =
          createDashboardSummary({
            sales,
            expenses,
            products,
          });

        expect(
          summary.transactionCount,
        ).toBe(4);

        expect(
          summary.unitsSold,
        ).toBe(8);
      },
    );

    test(
      'calculates uncapped target progress',
      () => {
        const summary =
          createDashboardSummary({
            sales,
            expenses,
            products,
            dailySalesTarget: 25,
          });

        expect(
          summary.targetProgress,
        ).toBe(1.53);
      },
    );

    test(
      'separates all four payment methods',
      () => {
        expect(
          calculatePaymentSplit(
            sales,
          ),
        ).toEqual({
          cash: 7.5,
          qr: 13.8,
          credit_card: 5,
          debit_card: 12,
        });
      },
    );

    test(
      'defaults an unknown payment method to cash',
      () => {
        expect(
          calculatePaymentSplit([
            {
              totalRevenue: 10,
              paymentMethod:
                'unknown',
            },
          ]),
        ).toEqual({
          cash: 10,
          qr: 0,
          credit_card: 0,
          debit_card: 0,
        });
      },
    );

    test(
      'ranks products by units sold',
      () => {
        expect(
          calculateTopProducts(
            sales,
            3,
          ),
        ).toEqual([
          {
            productId: 'water',
            name: 'Mineral Water',
            quantity: 5,
            revenue: 12.5,
            grossProfit: 7.5,
          },
          {
            productId:
              'notebook',
            name: 'Notebook',
            quantity: 2,
            revenue: 13.8,
            grossProfit: 7,
          },
          {
            productId: 'cable',
            name: 'USB Cable',
            quantity: 1,
            revenue: 12,
            grossProfit: 5,
          },
        ]);
      },
    );

    test(
      'finds active low-stock products',
      () => {
        expect(
          getLowStockProducts(
            products,
          ).map(
            (product) =>
              product.name,
          ),
        ).toEqual([
          'USB Cable',
          'Notebook',
        ]);
      },
    );

    test(
      'excludes archived products from low-stock warnings',
      () => {
        const lowStockProducts =
          getLowStockProducts(
            products,
          );

        expect(
          lowStockProducts.some(
            (product) =>
              product.id ===
              'archived',
          ),
        ).toBe(false);
      },
    );

    test(
      'returns safe values for empty data',
      () => {
        expect(
          createDashboardSummary(),
        ).toEqual({
          totalSales: 0,
          totalCost: 0,
          grossProfit: 0,
          expenseTotal: 0,
          netProfit: 0,
          transactionCount: 0,
          unitsSold: 0,
          targetProgress: 0,
          paymentSplit: {
            cash: 0,
            qr: 0,
            credit_card: 0,
            debit_card: 0,
          },
          topProducts: [],
          lowStockProducts: [],
        });
      },
    );
  },
);
