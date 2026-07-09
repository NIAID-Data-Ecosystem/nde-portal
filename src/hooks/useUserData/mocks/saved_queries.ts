import { SavedQuery } from '../types';

/**
 * Mock saved queries used to populate the user's saved searches in
 * development mode.
 */
export const MOCK_SAVED_QUERIES: SavedQuery[] = [
  {
    query: '__all__',
    name: 'All Results',
    filters: {
      date: ['2000-01-01', '2026-12-31'],
      '-_exists_': ['date'],
    },
    saved_at: '2026-06-30T19:59:21.733Z',
    total: 12085524,
  },
  {
    total: 5678,
    name: '"Asthma"',
    query: '"Asthma"',
    filters: {},
    saved_at: '2026-06-09T16:21:22+00:00',
  },

  {
    total: 500,
    query: '"Asthma"',
    name: '"Asthma"',
    filters: {
      date: ['2000-01-01', '2026-12-31'],
      '-_exists_': ['date'],
    },
    saved_at: '2026-07-01T18:52:35.864Z',
  },
  {
    total: 91011,
    name: '"HIV" OR "AIDS"',
    query: '"HIV" OR "AIDS"',
    filters: {},
    saved_at: '2026-06-09T16:21:32+00:00',
  },
];
