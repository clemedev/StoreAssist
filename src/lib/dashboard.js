import {
  calculateExpenseTotal,
} from './expenses.js';

import {
  PAYMENT_METHOD_IDS,
} from './paymentMethods.js';

function roundMoney(value) {
  return Math.round(
    (Number(value) + Number.EPSILON) *
      100,
  ) / 100;
}

function normalizeList(value) {
  return Array.isArray(value)
    ? value
    : [];
}

export function calculatePaymentSplit(
  sales,
) {
  const split =
    Object.fromEntries(
      PAYMENT_METHOD_IDS.map(
        (paymentMethod) => [
          paymentMethod,
          0,
        ],
      ),
    );

  for (
    const sale of
    normalizeList(sales)
  ) {
    const paymentMethod =
      PAYMENT_METHOD_IDS.includes(
        sale?.paymentMethod,
      )
        ? sale.paymentMethod
        : 'cash';

    split[paymentMethod] =
      roundMoney(
        split[paymentMethod] +
          (
            Number(
              sale?.totalRevenue,
            ) || 0
          ),
      );
  }

  return split;
}

export function calculateTopProducts(
  sales,
  limit = 3,
) {
  const totals = new Map();

  for (
    const sale of
    normalizeList(sales)
  ) {
    const productId =
      sale?.productId ??
      sale?.productName;

    if (!productId) {
      continue;
    }

    const current =
      totals.get(productId) ?? {
        productId:
          sale?.productId ??
          null,

        name:
          sale?.productName ??
          'Unknown product',

        quantity: 0,
        revenue: 0,
        grossProfit: 0,
      };

    current.quantity +=
      Number(sale?.quantity) || 0;

    current.revenue =
      roundMoney(
        current.revenue +
          (
            Number(
              sale?.totalRevenue,
            ) || 0
          ),
      );

    current.grossProfit =
      roundMoney(
        current.grossProfit +
          (
            Number(
              sale?.grossProfit,
            ) || 0
          ),
      );

    totals.set(
      productId,
      current,
    );
  }

  return [...totals.values()]
    .sort(
      (first, second) => {
        if (
          second.quantity !==
          first.quantity
        ) {
          return (
            second.quantity -
            first.quantity
          );
        }

        return (
          second.revenue -
          first.revenue
        );
      },
    )
    .slice(
      0,
      Math.max(
        0,
        Number(limit) || 0,
      ),
    );
}

export function getLowStockProducts(
  products,
) {
  return normalizeList(products)
    .filter(
      (product) =>
        product?.isActive !== false &&
        Number(
          product?.currentStock,
        ) <=
          Number(
            product
              ?.lowStockThreshold ??
              0,
          ),
    )
    .sort(
      (first, second) =>
        Number(
          first.currentStock,
        ) -
        Number(
          second.currentStock,
        ),
    );
}

export function createDashboardSummary({
  sales = [],
  expenses = [],
  products = [],
  dailySalesTarget = 500,
} = {}) {
  const normalizedSales =
    normalizeList(sales);

  const normalizedExpenses =
    normalizeList(expenses);

  const totalSales =
    roundMoney(
      normalizedSales.reduce(
        (total, sale) =>
          total +
          (
            Number(
              sale?.totalRevenue,
            ) || 0
          ),
        0,
      ),
    );

  const totalCost =
    roundMoney(
      normalizedSales.reduce(
        (total, sale) =>
          total +
          (
            Number(
              sale?.totalCost,
            ) || 0
          ),
        0,
      ),
    );

  const grossProfit =
    roundMoney(
      normalizedSales.reduce(
        (total, sale) =>
          total +
          (
            Number(
              sale?.grossProfit,
            ) || 0
          ),
        0,
      ),
    );

  const expenseTotal =
    calculateExpenseTotal(
      normalizedExpenses,
    );

  const netProfit =
    roundMoney(
      grossProfit -
        expenseTotal,
    );

  const unitsSold =
    normalizedSales.reduce(
      (total, sale) =>
        total +
        (
          Number(
            sale?.quantity,
          ) || 0
        ),
      0,
    );

  const normalizedTarget =
    Number(
      dailySalesTarget,
    );

  const targetProgress =
    Number.isFinite(
      normalizedTarget,
    ) &&
    normalizedTarget > 0
      ? roundMoney(
          totalSales /
            normalizedTarget,
        )
      : 0;

  return {
    totalSales,
    totalCost,
    grossProfit,
    expenseTotal,
    netProfit,

    transactionCount:
      normalizedSales.length,

    unitsSold,

    targetProgress,

    paymentSplit:
      calculatePaymentSplit(
        normalizedSales,
      ),

    topProducts:
      calculateTopProducts(
        normalizedSales,
        3,
      ),

    lowStockProducts:
      getLowStockProducts(
        products,
      ),
  };
}
