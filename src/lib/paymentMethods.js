export const PAYMENT_METHODS = [
  {
    id: 'cash',
    label: 'Cash',
    icon: '💵',
  },
  {
    id: 'qr',
    label: 'QR',
    icon: '▦',
  },
  {
    id: 'credit_card',
    label: 'Credit card',
    icon: '◈',
  },
  {
    id: 'debit_card',
    label: 'Debit card',
    icon: '▣',
  },
];

export const PAYMENT_METHOD_IDS =
  PAYMENT_METHODS.map(
    (method) => method.id,
  );

export function isValidPaymentMethod(
  paymentMethod,
) {
  return PAYMENT_METHOD_IDS.includes(
    paymentMethod,
  );
}

export function normalizePaymentMethod(
  paymentMethod,
) {
  return isValidPaymentMethod(
    paymentMethod,
  )
    ? paymentMethod
    : 'cash';
}

export function getPaymentMethod(
  paymentMethod,
) {
  const normalized =
    normalizePaymentMethod(
      paymentMethod,
    );

  return PAYMENT_METHODS.find(
    (method) =>
      method.id === normalized,
  );
}
