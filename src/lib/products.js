function roundMoney(value) {
  return Math.round(
    (Number(value) + Number.EPSILON) *
      100,
  ) / 100;
}

function requireNonNegativeMoney(
  value,
  label,
) {
  const amount = Number(value);

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error(
      `${label} must be a valid non-negative amount.`,
    );
  }

  return roundMoney(amount);
}

function requireNonNegativeInteger(
  value,
  label,
) {
  const amount = Number(value);

  if (
    !Number.isInteger(amount) ||
    amount < 0
  ) {
    throw new Error(
      `${label} must be a non-negative whole number.`,
    );
  }

  return amount;
}

export function calculateProductMargin({
  sellingPrice,
  costPrice,
}) {
  const normalizedSellingPrice =
    requireNonNegativeMoney(
      sellingPrice,
      'Selling price',
    );

  const normalizedCostPrice =
    requireNonNegativeMoney(
      costPrice,
      'Cost price',
    );

  const profitPerUnit =
    roundMoney(
      normalizedSellingPrice -
        normalizedCostPrice,
    );

  const marginPercent =
    normalizedSellingPrice > 0
      ? roundMoney(
          (
            profitPerUnit /
            normalizedSellingPrice
          ) * 100,
        )
      : 0;

  return {
    sellingPrice:
      normalizedSellingPrice,

    costPrice:
      normalizedCostPrice,

    profitPerUnit,
    marginPercent,
  };
}

export function createProduct({
  id,
  name,
  sellingPrice,
  costPrice,
  currentStock = 0,
  lowStockThreshold = 5,
  isActive = true,
  createdAt,
  updatedAt,
}) {
  const cleanName =
    String(name ?? '').trim();

  if (!cleanName) {
    throw new Error(
      'Product name is required.',
    );
  }

  const pricing =
    calculateProductMargin({
      sellingPrice,
      costPrice,
    });

  const normalizedStock =
    requireNonNegativeInteger(
      currentStock,
      'Current stock',
    );

  const normalizedThreshold =
    requireNonNegativeInteger(
      lowStockThreshold,
      'Low-stock threshold',
    );

  const now =
    updatedAt ??
    createdAt ??
    new Date().toISOString();

  return {
    id:
      id ??
      crypto.randomUUID(),

    name: cleanName,

    sellingPrice:
      pricing.sellingPrice,

    costPrice:
      pricing.costPrice,

    profitPerUnit:
      pricing.profitPerUnit,

    marginPercent:
      pricing.marginPercent,

    currentStock:
      normalizedStock,

    lowStockThreshold:
      normalizedThreshold,

    isLowStock:
      normalizedStock <=
      normalizedThreshold,

    isActive:
      Boolean(isActive),

    createdAt:
      createdAt ?? now,

    updatedAt: now,
  };
}

export function adjustProductStock(
  product,
  change,
) {
  if (!product?.id) {
    throw new Error(
      'A valid product is required.',
    );
  }

  const normalizedChange =
    Number(change);

  if (
    !Number.isInteger(
      normalizedChange,
    )
  ) {
    throw new Error(
      'Stock adjustment must be a whole number.',
    );
  }

  const currentStock =
    requireNonNegativeInteger(
      product.currentStock,
      'Current stock',
    );

  const nextStock =
    currentStock +
    normalizedChange;

  if (nextStock < 0) {
    throw new Error(
      'Stock cannot fall below zero.',
    );
  }

  return {
    ...product,

    currentStock: nextStock,

    isLowStock:
      nextStock <=
      Number(
        product.lowStockThreshold ??
          0,
      ),

    updatedAt:
      new Date().toISOString(),
  };
}

export function archiveProduct(
  product,
) {
  if (!product?.id) {
    throw new Error(
      'A valid product is required.',
    );
  }

  return {
    ...product,
    isActive: false,
    updatedAt:
      new Date().toISOString(),
  };
}
