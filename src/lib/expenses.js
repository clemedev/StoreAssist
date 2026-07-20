export const EXPENSE_CATEGORIES = [
  'inventory',
  'packaging',
  'transport',
  'utilities',
  'rent',
  'maintenance',
  'marketing',
  'other',
];

export const EXPENSE_SOURCES = [
  'manual',
  'receipt',
];

function roundMoney(value) {
  return Math.round(
    (Number(value) + Number.EPSILON) *
      100,
  ) / 100;
}

export function isValidExpenseCategory(
  category,
) {
  return EXPENSE_CATEGORIES.includes(
    category,
  );
}

export function normalizeExpenseCategory(
  category,
) {
  return isValidExpenseCategory(
    category,
  )
    ? category
    : 'other';
}

export function normalizeExpenseSource(
  source,
) {
  return EXPENSE_SOURCES.includes(
    source,
  )
    ? source
    : 'manual';
}

export function createExpense({
  id,
  category = 'other',
  amount,
  note = '',
  date,
  source = 'manual',
  createdAt,
  updatedAt,
}) {
  const normalizedAmount =
    Number(amount);

  if (
    !Number.isFinite(
      normalizedAmount,
    ) ||
    normalizedAmount <= 0
  ) {
    throw new Error(
      'Expense amount must be greater than zero.',
    );
  }

  const now =
    updatedAt ??
    createdAt ??
    new Date().toISOString();

  const expenseDate =
    date ??
    now.slice(0, 10);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      expenseDate,
    )
  ) {
    throw new Error(
      'Expense date must use YYYY-MM-DD format.',
    );
  }

  return {
    id:
      id ??
      crypto.randomUUID(),

    category:
      normalizeExpenseCategory(
        category,
      ),

    amount:
      roundMoney(
        normalizedAmount,
      ),

    note:
      String(note ?? '').trim(),

    date: expenseDate,

    source:
      normalizeExpenseSource(
        source,
      ),

    createdAt:
      createdAt ?? now,

    updatedAt: now,
  };
}

export function calculateExpenseTotal(
  expenses,
) {
  if (!Array.isArray(expenses)) {
    return 0;
  }

  return roundMoney(
    expenses.reduce(
      (total, expense) =>
        total +
        (Number(expense?.amount) ||
          0),
      0,
    ),
  );
}

export function groupExpensesByCategory(
  expenses,
) {
  if (!Array.isArray(expenses)) {
    return [];
  }

  const totals = new Map();

  for (const expense of expenses) {
    const category =
      normalizeExpenseCategory(
        expense?.category,
      );

    const amount =
      Number(expense?.amount) || 0;

    totals.set(
      category,
      roundMoney(
        (
          totals.get(category) ??
          0
        ) + amount,
      ),
    );
  }

  return [...totals.entries()]
    .map(
      ([category, amount]) => ({
        category,
        amount,
      }),
    )
    .sort(
      (first, second) =>
        second.amount -
        first.amount,
    );
}
