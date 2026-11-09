import { FormattedResource } from 'src/utils/api/types';
import {
  formatCollectionSize,
  getContentTypeItems,
  getResourceCatalogContentTypeItems,
} from './helpers';

// The helper only reads `about` and `exampleOfWork`, so the fixtures are
// cast rather than filled out with a whole FormattedResource.
const resource = (data: Record<string, unknown>) =>
  data as unknown as FormattedResource;

describe('formatCollectionSize', () => {
  it('returns count and unitText from `value`', () => {
    expect(formatCollectionSize([{ value: 42, unitText: 'genomes' }])).toEqual({
      count: '42',
      unitText: 'genomes',
    });
  });

  it('prefers `minValue` over `maxValue` and `value`, formatting count as "N+"', () => {
    expect(
      formatCollectionSize([
        { minValue: 10, maxValue: 20, value: 30, unitText: 'genomes' },
      ]),
    ).toEqual({ count: '10+', unitText: 'genomes' });
  });

  it('prefers `maxValue` over `value` when `minValue` is absent', () => {
    expect(
      formatCollectionSize([{ maxValue: 20, value: 30, unitText: 'genomes' }]),
    ).toEqual({ count: '20', unitText: 'genomes' });
  });

  it('formats large numbers with grouping via toLocaleString', () => {
    expect(
      formatCollectionSize([{ value: 1234567, unitText: 'genomes' }]),
    ).toEqual({ count: '1,234,567', unitText: 'genomes' });
  });

  it('returns null when unitText is missing, even if a numeric field is present', () => {
    expect(formatCollectionSize([{ value: 42 }])).toBeNull();
  });

  it('returns null when none of minValue/maxValue/value is a number', () => {
    expect(formatCollectionSize([{ unitText: 'genomes' }])).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(formatCollectionSize(undefined)).toBeNull();
  });

  it('returns null for an empty array', () => {
    expect(formatCollectionSize([])).toBeNull();
  });

  it('only reads the first entry of the array', () => {
    expect(
      formatCollectionSize([
        { value: 1, unitText: 'genomes' },
        { value: 2, unitText: 'samples' },
      ]),
    ).toEqual({ count: '1', unitText: 'genomes' });
  });
});

describe('getContentTypeItems', () => {
  it('handles `about` returned as a single object', () => {
    expect(
      getContentTypeItems(
        resource({
          about: { name: 'Genome', displayName: 'Genome' },
        }),
      ),
    ).toEqual([
      {
        name: 'Genome',
        value: 'Genome',
        field: 'about.name',
        query: '(about.name:"Genome" OR exampleOfWork.about.name:"Genome")',
      },
    ]);
  });

  it('handles `about` returned as an array', () => {
    const items = getContentTypeItems(
      resource({
        about: [
          { name: 'Genome', displayName: 'Genome' },
          { name: 'Image', displayName: 'Image' },
        ],
      }),
    );

    expect(items.map(item => item.value)).toEqual(['Genome', 'Image']);
  });

  it('labels with displayName but searches on name', () => {
    // EMDB records: displayName is title-cased, name is not, and
    // only `name` is indexed under exampleOfWork.about.
    const items = getContentTypeItems(
      resource({
        exampleOfWork: {
          about: [
            {
              name: 'electron micrograph',
              displayName: 'Electron Micrograph',
            },
            { name: 'Tomogram', displayName: 'Tomogram' },
            { name: '3D EM Map', displayName: '3D EM Map' },
          ],
        },
      }),
    );

    expect(items).toHaveLength(3);
    expect(items[0]).toEqual({
      name: 'Electron Micrograph',
      value: 'electron micrograph',
      field: 'about.name',
      query:
        '(about.name:"electron micrograph" OR exampleOfWork.about.name:"electron micrograph")',
    });
    expect(items[1].query).toEqual(
      '(about.name:"Tomogram" OR exampleOfWork.about.name:"Tomogram")',
    );
  });

  it('handles `exampleOfWork.about` returned as a single object', () => {
    const items = getContentTypeItems(
      resource({
        exampleOfWork: {
          about: { name: 'Genome', displayName: 'Genome' },
        },
      }),
    );

    expect(items.map(item => item.value)).toEqual(['Genome']);
  });

  it('flattens `exampleOfWork` returned as an array', () => {
    const items = getContentTypeItems(
      resource({
        exampleOfWork: [
          { about: { name: 'Genome' } },
          { about: [{ name: 'Image' }] },
        ],
      }),
    );

    expect(items.map(item => item.value)).toEqual(['Genome', 'Image']);
  });

  it('collapses values shared by both fields into one item', () => {
    // BV-BRC records carry the same value in both fields.
    const items = getContentTypeItems(
      resource({
        about: { name: 'Genome', displayName: 'Genome' },
        exampleOfWork: {
          about: { name: 'Genome', displayName: 'Genome' },
        },
      }),
    );

    expect(items).toHaveLength(1);
    expect(items[0].value).toEqual('Genome');
  });

  it('collapses values case-insensitively, keeping the first casing', () => {
    const items = getContentTypeItems(
      resource({
        about: { name: 'Image' },
        exampleOfWork: { about: { name: 'image' } },
      }),
    );

    expect(items).toHaveLength(1);
    expect(items[0].value).toEqual('Image');
    expect(items[0].query).toEqual(
      '(about.name:"Image" OR exampleOfWork.about.name:"Image")',
    );
  });

  it('upgrades the label when a later duplicate carries a displayName', () => {
    const items = getContentTypeItems(
      resource({
        about: { name: 'electron micrograph' },
        exampleOfWork: {
          about: {
            name: 'electron micrograph',
            displayName: 'Electron Micrograph',
          },
        },
      }),
    );

    expect(items).toEqual([
      {
        name: 'Electron Micrograph',
        value: 'electron micrograph',
        field: 'about.name',
        query:
          '(about.name:"electron micrograph" OR exampleOfWork.about.name:"electron micrograph")',
      },
    ]);
  });

  it('skips entries without a searchable name', () => {
    const items = getContentTypeItems(
      resource({
        about: [
          { displayName: 'Image', url: 'http://example.com/image' },
          { name: '   ' },
          { name: 'Genome' },
        ],
      }),
    );

    expect(items.map(item => item.value)).toEqual(['Genome']);
  });

  it('trims surrounding whitespace from labels and values', () => {
    const items = getContentTypeItems(
      resource({
        about: { name: ' Genome ', displayName: ' Genome Assembly ' },
      }),
    );

    expect(items[0]).toEqual({
      name: 'Genome Assembly',
      value: 'Genome',
      field: 'about.name',
      query: '(about.name:"Genome" OR exampleOfWork.about.name:"Genome")',
    });
  });

  it.each([
    ['undefined data', undefined],
    ['null data', null],
    ['empty record', {}],
    ['null fields', { about: null, exampleOfWork: null }],
    ['empty exampleOfWork', { exampleOfWork: {} }],
    ['null exampleOfWork.about', { exampleOfWork: { about: null } }],
  ])('returns no items for %s', (_label, data) => {
    expect(
      getContentTypeItems(data ? resource(data) : (data as null | undefined)),
    ).toEqual([]);
  });
});

describe('getResourceCatalogContentTypeItems', () => {
  it('widens the query to also match @type:Dataset records', () => {
    const items = getResourceCatalogContentTypeItems(
      resource({ about: { displayName: 'Dataset' } }),
    );

    expect(items).toEqual([
      {
        name: 'Dataset',
        value: 'Dataset',
        field: 'about.displayName',
        query: '(about.displayName:"Dataset" OR @type:"Dataset")',
      },
    ]);
  });

  it('widens the query to also match @type:Sample records', () => {
    const items = getResourceCatalogContentTypeItems(
      resource({ about: { displayName: 'Sample' } }),
    );

    expect(items[0].query).toEqual(
      '(about.displayName:"Sample" OR @type:"Sample")',
    );
  });

  it('maps Software to the underlying @type:ComputationalTool', () => {
    const items = getResourceCatalogContentTypeItems(
      resource({ about: { displayName: 'Software' } }),
    );

    expect(items[0].query).toEqual(
      '(about.displayName:"Software" OR @type:"ComputationalTool")',
    );
  });

  it('matches Dataset/Sample/Software case-insensitively', () => {
    const items = getResourceCatalogContentTypeItems(
      resource({ about: { displayName: 'dataset' } }),
    );

    expect(items[0].query).toEqual(
      '(about.displayName:"dataset" OR @type:"Dataset")',
    );
  });

  it('leaves unrelated about values without a query override', () => {
    const items = getResourceCatalogContentTypeItems(
      resource({ about: { displayName: 'Genomic' } }),
    );

    expect(items).toEqual([
      {
        name: 'Genomic',
        value: 'Genomic',
        field: 'about.displayName',
      },
    ]);
  });

  it('applies the mapping per-entry across an array of about values', () => {
    const items = getResourceCatalogContentTypeItems(
      resource({
        about: [{ displayName: 'Dataset' }, { displayName: 'Genomic' }],
      }),
    );

    expect(items[0].query).toEqual(
      '(about.displayName:"Dataset" OR @type:"Dataset")',
    );
    expect(items[1].query).toBeUndefined();
  });

  // Resource Catalogs in the index repeat identical `about` entries, and each
  // repeat would become a pill linking to the very same search.
  describe('duplicate about values', () => {
    it('keeps one item per repeated value', () => {
      const items = getResourceCatalogContentTypeItems(
        resource({
          about: [
            { displayName: 'Dataset' },
            { displayName: 'Dataset' },
            { displayName: 'Genome' },
            { displayName: 'Genome' },
            { displayName: 'Image' },
          ],
        }),
      );

      expect(items.map(item => item.value)).toEqual([
        'Dataset',
        'Genome',
        'Image',
      ]);
    });

    it('treats values differing only in casing as one', () => {
      const items = getResourceCatalogContentTypeItems(
        resource({
          about: [{ displayName: 'Dataset' }, { displayName: 'dataset' }],
        }),
      );

      expect(items).toHaveLength(1);
      expect(items[0].value).toBe('Dataset');
    });

    it('preserves encounter order', () => {
      const items = getResourceCatalogContentTypeItems(
        resource({
          about: [
            { displayName: 'Image' },
            { displayName: 'Dataset' },
            { displayName: 'Image' },
          ],
        }),
      );

      expect(items.map(item => item.value)).toEqual(['Image', 'Dataset']);
    });
  });
});
