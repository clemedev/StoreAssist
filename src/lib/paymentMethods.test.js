import {
  describe,
  expect,
  test,
} from 'vitest';

import {
  getPaymentMethod,
  isValidPaymentMethod,
  normalizePaymentMethod,
  PAYMENT_METHOD_IDS,
} from './paymentMethods.js';

describe(
  'StoreAssist payment methods',
  () => {
    test(
      'supports all four payment methods',
      () => {
        expect(
          PAYMENT_METHOD_IDS,
        ).toEqual([
          'cash',
          'qr',
          'credit_card',
          'debit_card',
        ]);
      },
    );

    test(
      'validates supported payment methods',
      () => {
        expect(
          isValidPaymentMethod('cash'),
        ).toBe(true);

        expect(
          isValidPaymentMethod('qr'),
        ).toBe(true);

        expect(
          isValidPaymentMethod(
            'credit_card',
          ),
        ).toBe(true);

        expect(
          isValidPaymentMethod(
            'debit_card',
          ),
        ).toBe(true);

        expect(
          isValidPaymentMethod('cheque'),
        ).toBe(false);
      },
    );

    test(
      'defaults invalid values to cash',
      () => {
        expect(
          normalizePaymentMethod(
            'unknown',
          ),
        ).toBe('cash');

        expect(
          normalizePaymentMethod(null),
        ).toBe('cash');
      },
    );

    test(
      'returns payment method details',
      () => {
        expect(
          getPaymentMethod(
            'credit_card',
          ),
        ).toMatchObject({
          id: 'credit_card',
          label: 'Credit card',
        });

        expect(
          getPaymentMethod(
            'debit_card',
          ),
        ).toMatchObject({
          id: 'debit_card',
          label: 'Debit card',
        });
      },
    );
  },
);
