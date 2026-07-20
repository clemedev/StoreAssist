import {
  archiveProduct,
  createProduct,
} from './products.js';

import {
  adjustProductStock,
} from './products.js';

import {
  createSale,
} from './sales.js';

import {
  createExpense,
} from './expenses.js';

const STORAGE_KEYS = {
  products:
    'storeassist.products',

  sales:
    'storeassist.sales',

  expenses:
    'storeassist.expenses',

  settings:
    'storeassist.settings',
};

const DEFAULT_SETTINGS = {
  dailySalesTarget: 500,
  lowStockEnabled: true,
};

function readJSON(
  key,
  fallback,
) {
  try {
    const stored =
      localStorage.getItem(key);

    if (stored === null) {
      return fallback;
    }

    return JSON.parse(stored);
  } catch {
    return fallback;
  }
}

function writeJSON(
  key,
  value,
) {
  localStorage.setItem(
    key,
    JSON.stringify(value),
  );
}

function readList(key) {
  const value = readJSON(
    key,
    [],
  );

  return Array.isArray(value)
    ? value
    : [];
}

export function getProducts({
  includeArchived = false,
} = {}) {
  const products = readList(
    STORAGE_KEYS.products,
  );

  return includeArchived
    ? products
    : products.filter(
        (product) =>
          product.isActive !== false,
      );
}

export function saveProduct(
  productInput,
) {
  const products = readList(
    STORAGE_KEYS.products,
  );

  const existingIndex =
    productInput?.id
      ? products.findIndex(
          (product) =>
            product.id ===
            productInput.id,
        )
      : -1;

  const existingProduct =
    existingIndex >= 0
      ? products[existingIndex]
      : null;

  const product = createProduct({
    ...existingProduct,
    ...productInput,

    createdAt:
      existingProduct?.createdAt ??
      productInput?.createdAt,

    updatedAt:
      new Date().toISOString(),
  });

  if (existingIndex >= 0) {
    products[existingIndex] =
      product;
  } else {
    products.push(product);
  }

  writeJSON(
    STORAGE_KEYS.products,
    products,
  );

  return product;
}

export function changeStock(
  productId,
  change,
) {
  const products = readList(
    STORAGE_KEYS.products,
  );

  const index =
    products.findIndex(
      (product) =>
        product.id === productId,
    );

  if (index < 0) {
    throw new Error(
      'Product could not be found.',
    );
  }

  const updated =
    adjustProductStock(
      products[index],
      change,
    );

  products[index] = updated;

  writeJSON(
    STORAGE_KEYS.products,
    products,
  );

  return updated;
}

export function archiveStoredProduct(
  productId,
) {
  const products = readList(
    STORAGE_KEYS.products,
  );

  const index =
    products.findIndex(
      (product) =>
        product.id === productId,
    );

  if (index < 0) {
    throw new Error(
      'Product could not be found.',
    );
  }

  const archived =
    archiveProduct(
      products[index],
    );

  products[index] = archived;

  writeJSON(
    STORAGE_KEYS.products,
    products,
  );

  return archived;
}

export function getSales() {
  return readList(
    STORAGE_KEYS.sales,
  );
}

export function saveSale(
  saleInput,
) {
  const products = getProducts({
    includeArchived: true,
  });

  const product =
    products.find(
      (item) =>
        item.id ===
        saleInput?.productId,
    );

  if (
    !product ||
    product.isActive === false
  ) {
    throw new Error(
      'An active product is required.',
    );
  }

  const quantity =
    Number(
      saleInput?.quantity,
    );

  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    throw new Error(
      'Quantity must be a positive whole number.',
    );
  }

  if (
    quantity >
    Number(product.currentStock)
  ) {
    throw new Error(
      'There is not enough stock for this sale.',
    );
  }

  const sale = createSale({
    ...saleInput,

    productId: product.id,
    productName: product.name,

    unitPrice:
      saleInput?.unitPrice ??
      product.sellingPrice,

    unitCost:
      product.costPrice,
  });

  const sales = readList(
    STORAGE_KEYS.sales,
  );

  sales.unshift(sale);

  writeJSON(
    STORAGE_KEYS.sales,
    sales,
  );

  try {
    changeStock(
      product.id,
      -quantity,
    );
  } catch (error) {
    writeJSON(
      STORAGE_KEYS.sales,
      sales.filter(
        (item) =>
          item.id !== sale.id,
      ),
    );

    throw error;
  }

  return sale;
}

export function deleteSale(
  saleId,
) {
  const sales = readList(
    STORAGE_KEYS.sales,
  );

  const sale =
    sales.find(
      (item) =>
        item.id === saleId,
    );

  if (!sale) {
    throw new Error(
      'Sale could not be found.',
    );
  }

  writeJSON(
    STORAGE_KEYS.sales,
    sales.filter(
      (item) =>
        item.id !== saleId,
    ),
  );

  const products = getProducts({
    includeArchived: true,
  });

  const product =
    products.find(
      (item) =>
        item.id ===
        sale.productId,
    );

  if (product) {
    changeStock(
      product.id,
      Number(sale.quantity) ||
        0,
    );
  }

  return sale;
}

export function getExpenses() {
  return readList(
    STORAGE_KEYS.expenses,
  );
}

export function saveExpense(
  expenseInput,
) {
  const expense =
    createExpense(
      expenseInput,
    );

  const expenses = readList(
    STORAGE_KEYS.expenses,
  );

  expenses.unshift(expense);

  writeJSON(
    STORAGE_KEYS.expenses,
    expenses,
  );

  return expense;
}

export function deleteExpense(
  expenseId,
) {
  const expenses = readList(
    STORAGE_KEYS.expenses,
  );

  const expense =
    expenses.find(
      (item) =>
        item.id ===
        expenseId,
    );

  if (!expense) {
    throw new Error(
      'Expense could not be found.',
    );
  }

  writeJSON(
    STORAGE_KEYS.expenses,
    expenses.filter(
      (item) =>
        item.id !==
        expenseId,
    ),
  );

  return expense;
}

export function getSettings() {
  return {
    ...DEFAULT_SETTINGS,

    ...readJSON(
      STORAGE_KEYS.settings,
      {},
    ),
  };
}

export function saveSettings(
  changes,
) {
  const settings = {
    ...getSettings(),
    ...changes,
  };

  writeJSON(
    STORAGE_KEYS.settings,
    settings,
  );

  return settings;
}

export function clearStoreAssistData() {
  Object.values(
    STORAGE_KEYS,
  ).forEach(
    (key) =>
      localStorage.removeItem(key),
  );
}

export {
  STORAGE_KEYS,
};
