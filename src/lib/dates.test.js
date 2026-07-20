import {
  describe,
  expect,
  test,
} from 'vitest';

import {
  createDateRange,
  isDateInRange,
  lastNDates,
  shortDateLabel,
  toLocalISO,
} from './dates.js';

describe(
  'StoreAssist local date utilities',
  () => {
    test(
      'formats a local calendar date',
      () => {
        const date =
          new Date(
            2026,
            6,
            20,
            7,
            30,
          );

        expect(
          toLocalISO(date),
        ).toBe('2026-07-20');
      },
    );

    test(
      'returns the last seven dates in ascending order',
      () => {
        const endDate =
          new Date(
            2026,
            6,
            20,
            12,
            0,
          );

        expect(
          lastNDates(
            7,
            endDate,
          ),
        ).toEqual([
          '2026-07-14',
          '2026-07-15',
          '2026-07-16',
          '2026-07-17',
          '2026-07-18',
          '2026-07-19',
          '2026-07-20',
        ]);
      },
    );

    test(
      'handles month boundaries',
      () => {
        const endDate =
          new Date(
            2026,
            7,
            2,
            12,
            0,
          );

        expect(
          lastNDates(
            4,
            endDate,
          ),
        ).toEqual([
          '2026-07-30',
          '2026-07-31',
          '2026-08-01',
          '2026-08-02',
        ]);
      },
    );

    test(
      'handles year boundaries',
      () => {
        const endDate =
          new Date(
            2027,
            0,
            2,
            12,
            0,
          );

        expect(
          lastNDates(
            4,
            endDate,
          ),
        ).toEqual([
          '2026-12-30',
          '2026-12-31',
          '2027-01-01',
          '2027-01-02',
        ]);
      },
    );

    test(
      'creates an inclusive date range',
      () => {
        const range =
          createDateRange(
            3,
            new Date(
              2026,
              6,
              20,
              12,
              0,
            ),
          );

        expect(
          range,
        ).toEqual({
          dates: [
            '2026-07-18',
            '2026-07-19',
            '2026-07-20',
          ],
          fromDate:
            '2026-07-18',
          toDate:
            '2026-07-20',
        });
      },
    );

    test(
      'creates an empty date range',
      () => {
        expect(
          createDateRange(
            0,
            new Date(
              2026,
              6,
              20,
            ),
          ),
        ).toEqual({
          dates: [],
          fromDate: null,
          toDate: null,
        });
      },
    );

    test(
      'checks inclusive date ranges',
      () => {
        expect(
          isDateInRange(
            '2026-07-14',
            '2026-07-14',
            '2026-07-20',
          ),
        ).toBe(true);

        expect(
          isDateInRange(
            '2026-07-20',
            '2026-07-14',
            '2026-07-20',
          ),
        ).toBe(true);

        expect(
          isDateInRange(
            '2026-07-13',
            '2026-07-14',
            '2026-07-20',
          ),
        ).toBe(false);

        expect(
          isDateInRange(
            '2026-07-21',
            '2026-07-14',
            '2026-07-20',
          ),
        ).toBe(false);
      },
    );

    test(
      'supports an open-ended date range',
      () => {
        expect(
          isDateInRange(
            '2026-07-20',
            '2026-07-01',
            null,
          ),
        ).toBe(true);

        expect(
          isDateInRange(
            '2026-07-20',
            null,
            '2026-07-31',
          ),
        ).toBe(true);
      },
    );

    test(
      'rejects malformed range dates',
      () => {
        expect(
          isDateInRange(
            '20-07-2026',
            '2026-07-01',
            '2026-07-31',
          ),
        ).toBe(false);
      },
    );

    test(
      'creates compact chart labels',
      () => {
        expect(
          shortDateLabel(
            '2026-07-20',
          ),
        ).toBe('20/7');

        expect(
          shortDateLabel(
            '2026-01-05',
          ),
        ).toBe('5/1');
      },
    );

    test(
      'returns an empty chart label for invalid input',
      () => {
        expect(
          shortDateLabel(
            '20-07-2026',
          ),
        ).toBe('');

        expect(
          shortDateLabel(null),
        ).toBe('');
      },
    );

    test(
      'rejects an invalid date count',
      () => {
        expect(() =>
          lastNDates(-1),
        ).toThrow(
          'Date count must be a non-negative whole number.',
        );

        expect(() =>
          lastNDates(2.5),
        ).toThrow(
          'Date count must be a non-negative whole number.',
        );
      },
    );

    test(
      'rejects an invalid date value',
      () => {
        expect(() =>
          toLocalISO(
            'not-a-date',
          ),
        ).toThrow(
          'A valid date is required.',
        );

        expect(() =>
          lastNDates(
            7,
            'not-a-date',
          ),
        ).toThrow(
          'A valid end date is required.',
        );
      },
    );
  },
);
