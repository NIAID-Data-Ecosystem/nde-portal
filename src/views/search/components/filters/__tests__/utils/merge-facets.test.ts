import { Facet } from 'src/utils/api/types';
import { CONTENT_TYPE_ABOUT_FIELD } from 'src/views/search/config/content-type';
import { mergeFacets } from '../../utils/merge-facets';

const facet = (
  terms: { term: string; count: number }[],
  missing = 0,
): Facet[string] =>
  ({
    terms,
    missing,
    other: 0,
    total: terms.length,
    _type: 'terms',
  } as unknown as Facet[string]);

// The staging index has overlapping fields: records counted in
// exampleOfWork.about are also counted in about. The fixtures reproduce this
// overlap so it can be verified that mergeFacets does not double-count records.
const contentTypeFacets: Facet = {
  'about.name': facet(
    [
      { term: 'Protein', count: 276373 },
      { term: 'Genome', count: 178254 },
      { term: 'Image', count: 3024 },
    ],
    15712525,
  ),
  'exampleOfWork.about.name.raw': facet(
    [
      { term: 'Nucleotide Sequence', count: 248133 },
      { term: 'Genome', count: 118625 },
      { term: 'Tomogram', count: 3022 },
    ],
    16013038,
  ),
};

const TOTAL = 16462358;

describe('filters/utils/merge-facets', () => {
  describe('single-field filters', () => {
    it('passes terms and counts through untouched', () => {
      const result = mergeFacets(
        {
          'topicCategory.name.raw': facet([{ term: 'Genomics', count: 5 }], 3),
        },
        'topicCategory.name.raw',
        10,
      );

      expect(result).toEqual({
        terms: [{ term: 'Genomics', count: 5 }],
        existsCount: 7,
        missing: 3,
      });
    });

    it('returns null when the field is absent or has no terms', () => {
      expect(mergeFacets({}, 'topicCategory.name.raw', 10)).toBeNull();
      expect(mergeFacets(undefined, 'topicCategory.name.raw', 10)).toBeNull();
    });
  });

  describe('merged multi-field filters', () => {
    it('unions the terms of every field', () => {
      const result = mergeFacets(
        contentTypeFacets,
        CONTENT_TYPE_ABOUT_FIELD,
        TOTAL,
      );

      expect(result?.terms.map(t => t.term).sort()).toEqual([
        'Genome',
        'Image',
        'Nucleotide Sequence',
        'Protein',
        'Tomogram',
      ]);
    });

    it('takes the max count on overlap, never the sum', () => {
      const result = mergeFacets(
        contentTypeFacets,
        CONTENT_TYPE_ABOUT_FIELD,
        TOTAL,
      );
      const genome = result?.terms.find(t => t.term === 'Genome');

      // Summing would claim 296,879 results and deliver 178,254.
      expect(genome?.count).toBe(178254);
    });

    it('orders terms by descending count', () => {
      const result = mergeFacets(
        contentTypeFacets,
        CONTENT_TYPE_ABOUT_FIELD,
        TOTAL,
      );

      expect(result?.terms.map(t => t.term)).toEqual([
        'Protein',
        'Nucleotide Sequence',
        'Genome',
        'Image',
        'Tomogram',
      ]);
    });

    it('collapses terms case-insensitively, keeping the first casing', () => {
      const result = mergeFacets(
        {
          'about.name': facet([{ term: 'Image', count: 10 }]),
          'exampleOfWork.about.name.raw': facet([{ term: 'image', count: 40 }]),
        },
        CONTENT_TYPE_ABOUT_FIELD,
        100,
      );

      expect(result?.terms).toEqual([{ term: 'Image', count: 40 }]);
    });

    it('derives Any/No counts from the field matching the most records', () => {
      const result = mergeFacets(
        contentTypeFacets,
        CONTENT_TYPE_ABOUT_FIELD,
        TOTAL,
      );

      // about.name matches 749,833 records; exampleOfWork only 449,320.
      expect(result?.existsCount).toBe(749833);
      expect(result?.missing).toBe(TOTAL - 749833);
    });

    it('falls back to whichever merged field is present', () => {
      const result = mergeFacets(
        {
          'exampleOfWork.about.name.raw': facet(
            [{ term: 'Tomogram', count: 3022 }],
            5,
          ),
        },
        CONTENT_TYPE_ABOUT_FIELD,
        100,
      );

      expect(result?.terms).toEqual([{ term: 'Tomogram', count: 3022 }]);
      expect(result?.existsCount).toBe(95);
    });
  });
});
