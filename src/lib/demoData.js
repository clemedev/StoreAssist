import {
  lastNDates,
} from './dates.js';

import {
  clearStoreAssistData,
  saveExpense,
  saveProduct,
  saveSale,
  saveSettings,
} from './store.js';

export const DEMO_PRODUCTS = [
  {
    id: 'demo-water',
    name: 'Mineral Water',
    sellingPrice: 2.5,
    costPrice: 1,
    currentStock: 40,
    lowStockThreshold: 10,
  },
  {
    id: 'demo-noodles',
    name: 'Instant Noodles',
    sellingPrice: 3.5,
    costPrice: 2,
    currentStock: 24,
    lowStockThreshold: 8,
  },
  {
    id: 'demo-bread',
    name: 'Sandwich Bread',
    sellingPrice: 4.8,
    costPrice: 3.1,
    currentStock: 6,
    lowStockThreshold: 8,
  },
  {
    id: 'demo-coffee',
    name: 'Coffee Sachets',
    sellingPrice: 8.5,
    costPrice: 5.2,
    currentStock: 18,
    lowStockThreshold: 6,
  },
  {
    id: 'demo-tissue',
    name: 'Tissue Pack',
    sellingPrice: 4,
    costPrice: 2.1,
    currentStock: 14,
    lowStockThreshold: 5,
  },
  {
    id: 'demo-batteries',
    name: 'AA Batteries',
    sellingPrice: 9.9,
    costPrice: 6.4,
    currentStock: 4,
    lowStockThreshold: 5,
  },
  {
    id: 'demo-cable',
    name: 'USB-C Cable',
    sellingPrice: 18,
    costPrice: 10.5,
    currentStock: 9,
    lowStockThreshold: 4,
  },
  {
    id: 'demo-bag',
    name: 'Reusable Bag',
    sellingPrice: 3,
    costPrice: 1.2,
    currentStock: 22,
    lowStockThreshold: 7,
  },
];

const PAYMENT_ROTATION = [
  'cash',
  'qr',
  'credit_card',
  'debit_card',
];

const EXPENSE_TEMPLATES = [
  {
    category: 'inventory',
    amount: 185.5,
    note: 'Weekly stock purchase',
    source: 'receipt',
  },
  {
    category: 'transport',
    amount: 28,
    note: 'Supplier delivery',
    source: 'manual',
  },
  {
    category: 'packaging',
    amount: 35.8,
    note: 'Shopping bags and labels',
    source: 'receipt',
  },
  {
    category: 'utilities',
    amount: 92,
    note: 'Electricity and internet',
    source: 'manual',
  },
  {
    category: 'marketing',
    amount: 45,
    note: 'Local promotion',
    source: 'manual',
  },
];

function quantityFor(
  productIndex,
  dayIndex,
) {
  return (
    (
      productIndex +
      dayIndex
    ) %
    4
  ) + 1;
}

export function seedDemoData({
  dayCount = 14,
} = {}) {
  clearStoreAssistData();

  saveSettings({
    dailySalesTarget: 180,
    lowStockEnabled: true,
  });

  const products =
    DEMO_PRODUCTS.map(
      (product) =>
        saveProduct(product),
    );

  const dates =
    lastNDates(dayCount);

  for (
    let dayIndex = 0;
    dayIndex < dates.length;
    dayIndex += 1
  ) {
    const date =
      dates[dayIndex];

    const dailyProductCount =
      3 + (dayIndex % 3);

    for (
      let productIndex = 0;
      productIndex <
      dailyProductCount;
      productIndex += 1
    ) {
      const product =
        products[
          (
            productIndex +
            dayIndex
          ) %
          products.length
        ];

      const quantity =
        Math.min(
          quantityFor(
            productIndex,
            dayIndex,
          ),
          product.currentStock,
        );

      if (quantity <= 0) {
        continue;
      }

      saveSale({
        id:
          `demo-sale-${dayIndex}-${productIndex}`,

        productId:
          product.id,

        quantity,

        paymentMethod:
          PAYMENT_ROTATION[
            (
              dayIndex +
              productIndex
            ) %
              PAYMENT_ROTATION.length
          ],

        source: 'manual',
        date,

        createdAt:
          `${date}T10:00:00.000Z`,
      });

      product.currentStock -=
        quantity;
    }
  }

  EXPENSE_TEMPLATES.forEach(
    (expense, index) => {
      const date =
        dates[
          Math.max(
            0,
            dates.length -
              index * 3 -
              1,
          )
        ];

      saveExpense({
        id:
          `demo-expense-${index}`,

        ...expense,
        date,

        createdAt:
          `${date}T08:00:00.000Z`,

        updatedAt:
          `${date}T08:00:00.000Z`,
      });
    },
  );

  return {
    products,
    dates,
  };
}
