import {
  normalizePaymentMethod,
} from './paymentMethods.js';

function roundMoney(value) {
  return Math.round(
    (Number(value) + Number.EPSILON) *
      100,
  ) / 100;
}

export function calculateSaleTotals({
  quantity,
  unitPrice,
  unitCost = 0,
}) {
  const parsedQuantity =
    Number(quantity);

  const parsedUnitPrice =
    Number(unitPrice);

  const parsedUnitCost =
    Number(unitCost);

  if (
    !Number.isInteger(
      parsedQuantity,
    ) ||
    parsedQuantity <= 0
  ) {
    throw new Error(
      'Quantity must be a positive whole number.',
    );
  }

  if (
    !Number.isFinite(
      parsedUnitPrice,
    ) ||
    parsedUnitPrice < 0
  ) {
    throw new Error(
      'Unit price must be a valid non-negative amount.',
    );
  }

  if (
    !Number.isFinite(
      parsedUnitCost,
    ) ||
    parsedUnitCost < 0
  ) {
    throw new Error(
      'Unit cost must be a valid non-negative amount.',
    );
  }

  const totalRevenue =
    roundMoney(
      parsedQuantity *
        parsedUnitPrice,
    );

  const totalCost =
    roundMoney(
      parsedQuantity *
        parsedUnitCost,
    );

  return {
    quantity: parsedQuantity,
    unitPrice:
      roundMoney(parsedUnitPrice),
    unitCost:
      roundMoney(parsedUnitCost),
    totalRevenue,
    totalCost,
    grossProfit:
      roundMoney(
        totalRevenue - totalCost,
      ),
  };
}

export function createSale({
  id,
  productId,
  productName,
  quantity,
  unitPrice,
  unitCost = 0,
  paymentMethod = 'cash',
  source = 'manual',
  date,
  createdAt,
}) {
  const cleanProductId =
    String(productId ?? '').trim();

  const cleanProductName =
    String(productName ?? '').trim();

  if (!cleanProductId) {
    throw new Error(
      'Product ID is required.',
    );
  }

  if (!cleanProductName) {
    throw new Error(
      'Product name is required.',
    );
  }

  const totals =
    calculateSaleTotals({
      quantity,
      unitPrice,
      unitCost,
    });

  const now =
    createdAt ??
    new Date().toISOString();

  const saleDate =
    date ??
    now.slice(0, 10);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      saleDate,
    )
  ) {
    throw new Error(
      'Sale date must use YYYY-MM-DD format.',
    );
  }

  return {
    id:
      id ??
      crypto.randomUUID(),
    date: saleDate,
    productId: cleanProductId,
    productName:
      cleanProductName,
    quantity:
      totals.quantity,
    unitPrice:
      totals.unitPrice,
    unitCost:
      totals.unitCost,
    totalRevenue:
      totals.totalRevenue,
    totalCost:
      totals.totalCost,
    grossProfit:
      totals.grossProfit,
    paymentMethod:
      normalizePaymentMethod(
        paymentMethod,
      ),
    source,
    createdAt: now,
  };
}
