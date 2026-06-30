import { SavedQuery } from '../types';

/**
 * Mock saved queries used to populate the user's saved searches in
 * development mode.
 */
export const MOCK_SAVED_QUERIES: SavedQuery[] = [
  {
    total: 1234,
    name: `Search: "SARS-CoV-2" OR "Covid-19" OR "Wuhan coronavirus" OR "Wuhan pneumonia" OR "2019-nCoV" OR "HCoV-19"`,
    query: `"SARS-CoV-2" OR "Covid-19" OR "Wuhan coronavirus" OR "Wuhan pneumonia" OR "2019-nCoV" OR "HCoV-19"`,
    filters: {},
    saved_at: '2026-06-03T17:04:55+00:00',
  },
  {
    total: 5678,
    name: `Search: "Asthma"`,
    query: `"Asthma"`,
    filters: {},
    saved_at: '2026-06-09T16:21:22+00:00',
  },
  {
    total: 91011,
    name: `Search: "HIV" OR "AIDS"`,
    query: `"HIV" OR "AIDS"`,
    filters: {},
    saved_at: '2026-06-09T16:21:32+00:00',
  },
  {
    total: 1213,
    name: `Search: "Influenza" OR "Flu"`,
    query: `"Influenza" OR "Flu"`,
    filters: {},
    saved_at: '2026-06-09T16:21:37+00:00',
  },
  {
    total: 1415,
    name: `Search: "Malaria" OR "Plasmodium falciparum" OR "Plasmodium malariae" OR "Plasmodium ovale curtisi" OR "Plasmodium ovale wallikeri" OR "Plasmodium vivax" OR "Plasmodium knowlesi"`,
    query: `"Malaria" OR "Plasmodium falciparum" OR "Plasmodium malariae" OR "Plasmodium ovale curtisi" OR "Plasmodium ovale wallikeri" OR "Plasmodium vivax" OR "Plasmodium knowlesi"`,
    filters: {
      date: [
        '2000-01-01',
        '2026-12-31',
        {
          '-_exists_': ['date'],
        },
      ],
      'species.displayName.raw': ['Human | Homo sapiens'],
    },
    saved_at: '2026-06-09T16:21:42+00:00',
  },
  {
    total: 1617,
    name: `Search: "Tuberculosis" OR "Mycobacterium bovis" OR "Mycobacterium africanum" OR "Mycobacterium canetti" OR "Mycobacterium microti" OR "Phthisis"`,
    query: `"Tuberculosis" OR "Mycobacterium bovis" OR "Mycobacterium africanum" OR "Mycobacterium canetti" OR "Mycobacterium microti" OR "Phthisis"`,
    filters: {},
    saved_at: '2026-06-09T16:21:45+00:00',
  },
];
