import { FormattedResource } from 'src/utils/api/types';
import { getContentTypeItems } from './helpers';

// The helper only reads `about` and `exampleOfWork`, so the fixtures are
// cast rather than filled out with a whole FormattedResource.
const resource = (data: Record<string, unknown>) =>
  data as unknown as FormattedResource;

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
