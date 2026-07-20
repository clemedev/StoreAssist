import {
  describe,
  expect,
  test,
} from 'vitest';

import {
  calculateExpenseTotal,
  createExpense,
  EXPENSE_CATEGORIES,
  groupExpensesByCategory,
  isValidExpenseCategory,
  normalizeExpenseCategory,
  normalizeExpenseSource,
} from './expenses.js';

describe(
  'StoreAssist expense model',
  () => {
    test(
      'supports StoreAssist expense categories',
      () => {
        expect(
          EXPENSE_CATEGORIES,
        ).toEqual([
          'inventory',
          'packaging',
          'transport',
          'utilities',
          'rent',
          'maintenance',
          'marketing',
          'other',
        ]);
      },
    );

    test(
      'validates expense categories',
      () => {
        expect(
          isValidExpenseCategory(
            'inventory',
          ),
        ).toBe(true);

        expect(
          isValidExpenseCategory(
            'marketing',
          ),
        ).toBe(true);

        expect(
          isValidExpenseCategory(
            'unknown',
          ),
        ).toBe(false);
      },
    );

    test(
      'defaults an invalid category to other',
      () => {
        expect(
          normalizeExpenseCategory(
            'unknown',
          ),
        ).toBe('other');

        expect(
          normalizeExpenseCategory(
            null,
          ),
        ).toBe('other');
      },
    );

    test(
      'supports manual and receipt sources',
      () => {
        expect(
          normalizeExpenseSource(
            'manual',
          ),
        ).toBe('manual');

        expect(
          normalizeExpenseSource(
            'receipt',
          ),
        ).toBe('receipt');

        expect(
          normalizeExpenseSource(
            'unknown',
          ),
        ).toBe('manual');
      },
    );

    test(
      'creates a manual inventory expense',
      () => {
        const expense = createExpense({
          id: 'expense-1',
          category: 'inventory',
          amount: 125.75,
          note: 'Weekly stock purchase',
          date: '2026-07-20',
          source: 'manual',
          createdAt:
            '2026-07-20T08:00:00.000Z',
          updatedAt:
            '2026-07-20T08:00:00.000Z',
        });

        expect(expense).toEqual({
          id: 'expense-1',
          category: 'inventory',
          amount: 125.75,
          note: 'Weekly stock purchase',
          date: '2026-07-20',
          source: 'manual',
          createdAt:
            '2026-07-20T08:00:00.000Z',
          updatedAt:
            '2026-07-20T08:00:00.000Z',
        });
      },
    );

    test(
      'creates a receipt expense and trims its note',
      () => {
        const expense = createExpense({
          id: 'expense-2',
          category: 'packaging',
          amount: 24.499,
          note: '  Paper bags  ',
          date: '2026-07-20',
          source: 'receipt',
          createdAt:
            '2026-07-20T09:00:00.000Z',
          updatedAt:
            '2026-07-20T09:00:00.000Z',
        });

        expect(
          expense.amount,
        ).toBe(24.5);

        expect(
          expense.note,
        ).toBe('Paper bags');

        expect(
          expense.source,
        ).toBe('receipt');
      },
    );

    test(
      'calculates the total of all expenses',
      () => {
        expect(
          calculateExpenseTotal([
            {
              amount: 20,
            },
            {
              amount: 15.5,
            },
            {
              amount: 4.25,
            },
          ]),
        ).toBe(39.75);
      },
    );

    test(
      'returns zero for a missing expense list',
      () => {
        expect(
          calculateExpenseTotal(null),
        ).toBe(0);
      },
    );

    test(
      'groups expenses by category from highest to lowest',
      () => {
        expect(
          groupExpensesByCategory([
            {
              category: 'inventory',
              amount: 50,
            },
            {
              category: 'transport',
              amount: 12,
            },
            {
              category: 'inventory',
              amount: 25.5,
            },
            {
              category: 'utilities',
              amount: 40,
            },
            {
              category: 'invalid',
              amount: 5,
            },
          ]),
        ).toEqual([
          {
            category: 'inventory',
            amount: 75.5,
          },
          {
            category: 'utilities',
            amount: 40,
          },
          {
            category: 'transport',
            amount: 12,
          },
          {
            category: 'other',
            amount: 5,
          },
        ]);
      },
    );

    test(
      'rejects a zero expense amount',
      () => {
        expect(() =>
          createExpense({
            category: 'rent',
            amount: 0,
            date: '2026-07-20',
          }),
        ).toThrow(
          'Expense amount must be greater than zero.',
        );
      },
    );

    test(
      'rejects a negative expense amount',
      () => {
        expect(() =>
          createExpense({
            category: 'rent',
            amount: -10,
            date: '2026-07-20',
          }),
        ).toThrow(
          'Expense amount must be greater than zero.',
        );
      },
    );

    test(
      'rejects an invalid expense date',
      () => {
        expect(() =>
          createExpense({
            category: 'utilities',
            amount: 80,
            date: '20-07-2026',
          }),
        ).toThrow(
          'Expense date must use YYYY-MM-DD format.',
        );
      },
    );
  },
);
