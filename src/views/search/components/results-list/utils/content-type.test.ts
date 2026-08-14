import { FormattedResource } from 'src/utils/api/types';
import { getContentTypeLabel, getContentTypeTerms } from './content-type';

// The helper only reads `about` and `exampleOfWork`, so the fixtures are
// cast rather than filled out with a whole FormattedResource.
const resource = (data: Record<string, unknown>) =>
  data as unknown as FormattedResource;

describe('getContentTypeTerms', () => {
  it('merges both fields, normalizing single objects and arrays', () => {
    const terms = getContentTypeTerms(
      resource({
        about: { name: 'Image' },
        exampleOfWork: [
          { about: { name: 'Tomogram' } },
          { about: [{ name: '3D EM Map' }] },
        ],
      }),
    );

    expect(terms.map(term => term.name)).toEqual([
      'Image',
      'Tomogram',
      '3D EM Map',
    ]);
  });

  it('collapses a value repeated in both fields, keeping the ontology url', () => {
    // BV-BRC records carry the same term in both fields.
    const terms = getContentTypeTerms(
      resource({
        about: { name: 'Genome', displayName: 'Genome' },
        exampleOfWork: {
          about: {
            name: 'Genome',
            displayName: 'Genome',
            url: 'http://purl.obolibrary.org/obo/NCIT_C16629',
          },
        },
      }),
    );

    expect(terms).toEqual([
      {
        name: 'Genome',
        displayName: 'Genome',
        url: 'http://purl.obolibrary.org/obo/NCIT_C16629',
      },
    ]);
  });

  it('keeps the first url when both duplicates have one', () => {
    const terms = getContentTypeTerms(
      resource({
        about: { name: 'Genome', url: 'http://example.com/about' },
        exampleOfWork: {
          about: { name: 'Genome', url: 'http://example.com/example-of-work' },
        },
      }),
    );

    expect(terms).toHaveLength(1);
    expect(terms[0].url).toEqual('http://example.com/about');
  });

  it('fills in a displayName from a later duplicate', () => {
    const terms = getContentTypeTerms(
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

    expect(terms).toHaveLength(1);
    expect(terms[0].displayName).toEqual('Electron Micrograph');
  });

  it('collapses case-insensitively, keeping the first casing', () => {
    const terms = getContentTypeTerms(
      resource({
        about: { name: 'Image' },
        exampleOfWork: { about: { name: 'image', url: 'http://example.com' } },
      }),
    );

    expect(terms).toEqual([{ name: 'Image', url: 'http://example.com' }]);
  });

  it('skips entries without a searchable name and trims the ones it keeps', () => {
    const terms = getContentTypeTerms(
      resource({
        about: [
          { displayName: 'Image', url: 'http://example.com/image' },
          { name: '   ' },
          { name: ' Genome ' },
        ],
      }),
    );

    expect(terms.map(term => term.name)).toEqual(['Genome']);
  });

  it.each([
    ['undefined data', undefined],
    ['null data', null],
    ['empty record', {}],
    ['null fields', { about: null, exampleOfWork: null }],
    ['empty exampleOfWork', { exampleOfWork: {} }],
    ['null exampleOfWork.about', { exampleOfWork: { about: null } }],
  ])('returns no terms for %s', (_label, data) => {
    expect(
      getContentTypeTerms(data ? resource(data) : (data as null | undefined)),
    ).toEqual([]);
  });
});

describe('getContentTypeLabel', () => {
  it('prefers displayName, then name, then url', () => {
    expect(
      getContentTypeLabel({ name: 'electron micrograph', displayName: ' EM ' }),
    ).toEqual('EM');
    expect(getContentTypeLabel({ name: 'Genome' })).toEqual('Genome');
    expect(getContentTypeLabel({ url: 'http://example.com' })).toEqual(
      'http://example.com',
    );
    expect(getContentTypeLabel({})).toEqual('');
  });
});
