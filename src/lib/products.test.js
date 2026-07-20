import {
  describe,
  expect,
  test,
} from 'vitest';

import {
  adjustProductStock,
  archiveProduct,
  calculateProductMargin,
  createProduct,
} from './products.js';

describe(
  'StoreAssist inventory model',
  () => {
    test(
      'calculates profit and margin',
      () => {
        expect(
          calculateProductMargin({
            sellingPrice: 10,
            costPrice: 6,
          }),
        ).toEqual({
          sellingPrice: 10,
          costPrice: 6,
          profitPerUnit: 4,
          marginPercent: 40,
        });
      },
    );

    test(
      'rounds monetary values',
      () => {
        expect(
          calculateProductMargin({
            sellingPrice: 9.99,
            costPrice: 6.55,
          }),
        ).toEqual({
          sellingPrice: 9.99,
          costPrice: 6.55,
          profitPerUnit: 3.44,
          marginPercent: 34.43,
        });
      },
    );

    test(
      'creates a product with inventory details',
      () => {
        const product = createProduct({
          id: 'product-1',
          name: '  Mineral Water  ',
          sellingPrice: 2.5,
          costPrice: 1,
          currentStock: 20,
          lowStockThreshold: 5,
          createdAt:
            '2026-07-20T10:00:00.000Z',
          updatedAt:
            '2026-07-20T10:00:00.000Z',
        });

        expect(product).toEqual({
          id: 'product-1',
          name: 'Mineral Water',
          sellingPrice: 2.5,
          costPrice: 1,
          profitPerUnit: 1.5,
          marginPercent: 60,
          currentStock: 20,
          lowStockThreshold: 5,
          isLowStock: false,
          isActive: true,
          createdAt:
            '2026-07-20T10:00:00.000Z',
          updatedAt:
            '2026-07-20T10:00:00.000Z',
        });
      },
    );

    test(
      'flags stock at the warning level',
      () => {
        const product = createProduct({
          id: 'product-2',
          name: 'Notebook',
          sellingPrice: 6.9,
          costPrice: 3.4,
          currentStock: 5,
          lowStockThreshold: 5,
        });

        expect(
          product.isLowStock,
        ).toBe(true);
      },
    );

    test(
      'flags stock below the warning level',
      () => {
        const product = createProduct({
          id: 'product-3',
          name: 'USB Cable',
          sellingPrice: 12,
          costPrice: 7,
          currentStock: 2,
          lowStockThreshold: 5,
        });

        expect(
          product.isLowStock,
        ).toBe(true);
      },
    );

    test(
      'reduces product stock',
      () => {
        const product = createProduct({
          id: 'product-4',
          name: 'Tissue Pack',
          sellingPrice: 4,
          costPrice: 2,
          currentStock: 10,
          lowStockThreshold: 3,
        });

        const updated =
          adjustProductStock(
            product,
            -4,
          );

        expect(
          updated.currentStock,
        ).toBe(6);

        expect(
          updated.isLowStock,
        ).toBe(false);
      },
    );

    test(
      'marks a product low in stock after adjustment',
      () => {
        const product = createProduct({
          id: 'product-5',
          name: 'Batteries',
          sellingPrice: 8,
          costPrice: 4.5,
          currentStock: 8,
          lowStockThreshold: 3,
        });

        const updated =
          adjustProductStock(
            product,
            -5,
          );

        expect(
          updated.currentStock,
        ).toBe(3);

        expect(
          updated.isLowStock,
        ).toBe(true);
      },
    );

    test(
      'restores stock',
      () => {
        const product = createProduct({
          id: 'product-6',
          name: 'Shopping Bag',
          sellingPrice: 1,
          costPrice: 0.5,
          currentStock: 2,
          lowStockThreshold: 3,
        });

        const updated =
          adjustProductStock(
            product,
            10,
          );

        expect(
          updated.currentStock,
        ).toBe(12);

        expect(
          updated.isLowStock,
        ).toBe(false);
      },
    );

    test(
      'prevents stock from falling below zero',
      () => {
        const product = createProduct({
          id: 'product-7',
          name: 'Phone Charger',
          sellingPrice: 25,
          costPrice: 15,
          currentStock: 2,
          lowStockThreshold: 1,
        });

        expect(() =>
          adjustProductStock(
            product,
            -3,
          ),
        ).toThrow(
          'Stock cannot fall below zero.',
        );
      },
    );

    test(
      'archives a product without deleting it',
      () => {
        const product = createProduct({
          id: 'product-8',
          name: 'Instant Noodles',
          sellingPrice: 3,
          costPrice: 1.8,
          currentStock: 12,
          lowStockThreshold: 4,
        });

        const archived =
          archiveProduct(product);

        expect(
          archived.id,
        ).toBe(product.id);

        expect(
          archived.name,
        ).toBe(product.name);

        expect(
          archived.isActive,
        ).toBe(false);
      },
    );

    test(
      'rejects an empty product name',
      () => {
        expect(() =>
          createProduct({
            name: '   ',
            sellingPrice: 5,
            costPrice: 2,
          }),
        ).toThrow(
          'Product name is required.',
        );
      },
    );

    test(
      'rejects negative prices',
      () => {
        expect(() =>
          createProduct({
            name: 'Invalid Product',
            sellingPrice: -1,
            costPrice: 0,
          }),
        ).toThrow(
          'Selling price must be a valid non-negative amount.',
        );

        expect(() =>
          createProduct({
            name: 'Invalid Product',
            sellingPrice: 5,
            costPrice: -1,
          }),
        ).toThrow(
          'Cost price must be a valid non-negative amount.',
        );
      },
    );

    test(
      'rejects fractional stock values',
      () => {
        expect(() =>
          createProduct({
            name: 'Invalid Stock',
            sellingPrice: 5,
            costPrice: 2,
            currentStock: 2.5,
          }),
        ).toThrow(
          'Current stock must be a non-negative whole number.',
        );
      },
    );
  },
);
