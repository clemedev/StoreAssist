import {
  describe,
  expect,
  test,
} from 'vitest';

import {
  calculateSaleTotals,
  createSale,
} from './sales.js';

describe(
  'StoreAssist sales model',
  () => {
    test(
      'calculates revenue cost and gross profit',
      () => {
        expect(
          calculateSaleTotals({
            quantity: 3,
            unitPrice: 5,
            unitCost: 2.5,
          }),
        ).toEqual({
          quantity: 3,
          unitPrice: 5,
          unitCost: 2.5,
          totalRevenue: 15,
          totalCost: 7.5,
          grossProfit: 7.5,
        });
      },
    );

    test(
      'creates a cash sale with product snapshots',
      () => {
        const sale = createSale({
          id: 'sale-cash-1',
          productId: 'product-1',
          productName: 'Mineral Water',
          quantity: 2,
          unitPrice: 2.5,
          unitCost: 1,
          paymentMethod: 'cash',
          source: 'manual',
          date: '2026-07-20',
          createdAt:
            '2026-07-20T10:00:00.000Z',
        });

        expect(sale).toEqual({
          id: 'sale-cash-1',
          date: '2026-07-20',
          productId: 'product-1',
          productName: 'Mineral Water',
          quantity: 2,
          unitPrice: 2.5,
          unitCost: 1,
          totalRevenue: 5,
          totalCost: 2,
          grossProfit: 3,
          paymentMethod: 'cash',
          source: 'manual',
          createdAt:
            '2026-07-20T10:00:00.000Z',
        });
      },
    );

    test.each([
      'cash',
      'qr',
      'credit_card',
      'debit_card',
    ])(
      'supports the %s payment method',
      (paymentMethod) => {
        const sale = createSale({
          id: `sale-${paymentMethod}`,
          productId: 'product-2',
          productName: 'Notebook',
          quantity: 1,
          unitPrice: 6.9,
          unitCost: 3.4,
          paymentMethod,
          date: '2026-07-20',
          createdAt:
            '2026-07-20T11:00:00.000Z',
        });

        expect(
          sale.paymentMethod,
        ).toBe(paymentMethod);

        expect(
          sale.totalRevenue,
        ).toBe(6.9);

        expect(
          sale.grossProfit,
        ).toBe(3.5);
      },
    );

    test(
      'defaults an unsupported payment method to cash',
      () => {
        const sale = createSale({
          id: 'sale-default-payment',
          productId: 'product-3',
          productName: 'Tissue Pack',
          quantity: 1,
          unitPrice: 4,
          unitCost: 2,
          paymentMethod: 'cheque',
          date: '2026-07-20',
          createdAt:
            '2026-07-20T12:00:00.000Z',
        });

        expect(
          sale.paymentMethod,
        ).toBe('cash');
      },
    );

    test(
      'rejects an invalid quantity',
      () => {
        expect(() =>
          calculateSaleTotals({
            quantity: 0,
            unitPrice: 5,
            unitCost: 2,
          }),
        ).toThrow(
          'Quantity must be a positive whole number.',
        );
      },
    );

    test(
      'rejects a negative selling price',
      () => {
        expect(() =>
          calculateSaleTotals({
            quantity: 1,
            unitPrice: -1,
            unitCost: 0,
          }),
        ).toThrow(
          'Unit price must be a valid non-negative amount.',
        );
      },
    );

    test(
      'rejects a negative unit cost',
      () => {
        expect(() =>
          calculateSaleTotals({
            quantity: 1,
            unitPrice: 5,
            unitCost: -2,
          }),
        ).toThrow(
          'Unit cost must be a valid non-negative amount.',
        );
      },
    );

    test(
      'rejects an invalid date',
      () => {
        expect(() =>
          createSale({
            productId: 'product-4',
            productName: 'USB Cable',
            quantity: 1,
            unitPrice: 12,
            unitCost: 7,
            date: '20-07-2026',
          }),
        ).toThrow(
          'Sale date must use YYYY-MM-DD format.',
        );
      },
    );
  },
);
