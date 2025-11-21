import { FacetTermWithDetails } from '../../types';

export const getYear = (term: string): number | null => {
  if (!term || term === '-_exists_') return null;
  const y = parseInt(String(term).split('-')[0], 10);
  return Number.isFinite(y) ? y : null;
};

const normalizeTermForYear = (year: number) => `${year}-01-01`;

export const addMissingYears = (
  dates: FacetTermWithDetails[],
  opts?: {
    /** If provided, clamp the filled range to this start year(inclusive) or end year (inclusive). */
    endYear?: number;
    startYear?: number;
    makeLabel?: (year: number) => string;
  },
): FacetTermWithDetails[] => {
  const makeLabel = opts?.makeLabel ?? ((y: number) => String(y));

  const valid = dates.filter(
    d => d && d.term !== '-_exists_' && getYear(d.term) !== null,
  );

  // Index by year so we can quickly check whether a year already exists.
  const yearToEntry = new Map<number, FacetTermWithDetails>();
  for (const d of valid) {
    const y = getYear(d.term)!;
    if (!yearToEntry.has(y)) {
      yearToEntry.set(y, d);
    }
  }

  if (yearToEntry.size === 0) return [];

  const sortedYears = Array.from(yearToEntry.keys()).sort((a, b) => a - b);
  const start = opts?.startYear ?? sortedYears[0];
  const end = opts?.endYear ?? sortedYears[sortedYears.length - 1];

  const output: FacetTermWithDetails[] = [];
  for (let y = start; y <= end; y += 1) {
    const existing = yearToEntry.get(y);
    if (existing) {
      output.push(existing);
    } else {
      // Create a zero-count placeholder for the missing year.
      output.push({
        term: normalizeTermForYear(y),
        label: makeLabel(y),
        count: 0,
      });
    }
  }

  return output;
};
