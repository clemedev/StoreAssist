/**
 * Convert a date value into the local
 * YYYY-MM-DD calendar format.
 */
export function toLocalISO(
  value = new Date(),
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new Error(
      'A valid date is required.',
    );
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      '0',
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      '0',
    );

  return [
    year,
    month,
    day,
  ].join('-');
}

/**
 * Return today's local calendar date.
 */
export function todayISO() {
  return toLocalISO(
    new Date(),
  );
}

/**
 * Return the last number of local dates,
 * oldest first and ending today.
 */
export function lastNDates(
  count,
  endDate = new Date(),
) {
  const normalizedCount =
    Number(count);

  if (
    !Number.isInteger(
      normalizedCount,
    ) ||
    normalizedCount < 0
  ) {
    throw new Error(
      'Date count must be a non-negative whole number.',
    );
  }

  const end =
    new Date(endDate);

  if (
    Number.isNaN(
      end.getTime(),
    )
  ) {
    throw new Error(
      'A valid end date is required.',
    );
  }

  return Array.from(
    {
      length:
        normalizedCount,
    },

    (_, index) => {
      const offset =
        normalizedCount -
        index -
        1;

      const date =
        new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate() -
            offset,
        );

      return toLocalISO(date);
    },
  );
}

/**
 * Return the first and final date
 * from a local date window.
 */
export function createDateRange(
  count,
  endDate = new Date(),
) {
  const dates =
    lastNDates(
      count,
      endDate,
    );

  return {
    dates,

    fromDate:
      dates[0] ?? null,

    toDate:
      dates[
        dates.length - 1
      ] ?? null,
  };
}

/**
 * Determine whether an ISO date is
 * inside an inclusive date range.
 */
export function isDateInRange(
  date,
  fromDate,
  toDate,
) {
  if (
    typeof date !==
      'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(
      date,
    )
  ) {
    return false;
  }

  if (
    fromDate &&
    date < fromDate
  ) {
    return false;
  }

  if (
    toDate &&
    date > toDate
  ) {
    return false;
  }

  return true;
}

/**
 * Return a compact D/M chart label.
 */
export function shortDateLabel(
  isoDate,
) {
  if (
    typeof isoDate !==
      'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(
      isoDate,
    )
  ) {
    return '';
  }

  const [
    ,
    month,
    day,
  ] = isoDate.split('-');

  return `${Number(day)}/${Number(month)}`;
}
