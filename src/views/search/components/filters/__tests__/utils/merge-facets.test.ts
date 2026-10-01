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

  // Selecting a Content Type that names a resource type also matches records
  // of that type, so its count has to include them.
  describe('Content Type resource type widening', () => {
    const typedFacets: Facet = {
      'about.name': facet(
        [
          { term: 'Genome', count: 500 },
          { term: 'Dataset', count: 60 },
          { term: 'Software', count: 11 },
        ],
        90,
      ),
      'exampleOfWork.about.name.raw': facet(
        [{ term: 'Genome', count: 120 }],
        95,
      ),
      '@type': facet([
        { term: 'Dataset', count: 5000 },
        { term: 'ComputationalTool', count: 300 },
        { term: 'ResourceCatalog', count: 100 },
      ]),
    };

    const widened = () =>
      mergeFacets(typedFacets, CONTENT_TYPE_ABOUT_FIELD, 1000);

    it('adds the @type count to the terms that name a resource type', () => {
      const terms = widened()?.terms;

      // Disjoint sets: a ResourceCatalog about datasets is not @type:Dataset,
      // so unlike the overlapping content fields these counts are summed.
      expect(terms?.find(t => t.term === 'Dataset')?.count).toBe(5060);
      expect(terms?.find(t => t.term === 'Software')?.count).toBe(311);
    });

    it('leaves terms that name no resource type untouched', () => {
      expect(widened()?.terms.find(t => t.term === 'Genome')?.count).toBe(500);
    });

    it('re-sorts by the widened counts', () => {
      expect(widened()?.terms.map(t => t.term)).toEqual([
        'Dataset',
        'Genome',
        'Software',
      ]);
    });

    // @type is on every record, so an "Any" count including it would be the
    // whole index. The _exists_ query is not widened either.
    it('leaves the Any/No counts alone', () => {
      expect(widened()?.existsCount).toBe(910);
      expect(widened()?.missing).toBe(90);
    });

    it('does not add resource types that no record is about', () => {
      // @type:ResourceCatalog has no Content Type value, and nothing is about
      // samples here, so neither becomes an option.
      expect(widened()?.terms.map(t => t.term)).not.toContain('Sample');
    });

    it('is a no-op when the response has no @type facet', () => {
      const result = mergeFacets(
        {
          'about.name': facet([{ term: 'Dataset', count: 60 }], 90),
          'exampleOfWork.about.name.raw': facet(
            [{ term: 'Genome', count: 120 }],
            95,
          ),
        },
        CONTENT_TYPE_ABOUT_FIELD,
        1000,
      );

      expect(result?.terms.find(t => t.term === 'Dataset')?.count).toBe(60);
    });

    it('widens a single-field response too', () => {
      const result = mergeFacets(
        {
          'about.name': facet([{ term: 'Dataset', count: 60 }], 90),
          '@type': facet([{ term: 'Dataset', count: 5000 }]),
        },
        CONTENT_TYPE_ABOUT_FIELD,
        1000,
      );

      expect(result?.terms).toEqual([{ term: 'Dataset', count: 5060 }]);
    });

    it('does not widen other filters that happen to share a term', () => {
      const result = mergeFacets(
        {
          'topicCategory.name.raw': facet([{ term: 'Dataset', count: 7 }]),
          '@type': facet([{ term: 'Dataset', count: 5000 }]),
        },
        'topicCategory.name.raw',
        1000,
      );

      expect(result?.terms).toEqual([{ term: 'Dataset', count: 7 }]);
    });
  });
});
