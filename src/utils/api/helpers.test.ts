import { formatAPIResource } from './helpers';
import { APIResource } from './types';

const hit = (fields: Partial<APIResource> = {}): APIResource => ({
  _id: 'abc123',
  '@type': 'Dataset',
  ...fields,
});

describe('formatAPIResource', () => {
  it('returns undefined when there is no resource', () => {
    expect(formatAPIResource(undefined)).toBeUndefined();
    expect(formatAPIResource(null)).toBeUndefined();
  });

  it('keeps meaningful falsy values', () => {
    const resource = formatAPIResource(
      hit({
        isAccessibleForFree: false,
        version: 0,
        distribution: { contentSize: 0 },
      }),
    );

    expect(resource?.isAccessibleForFree).toBe(false);
    expect(resource?.version).toBe(0);
    expect(resource?.distribution?.[0].contentSize).toBe(0);
  });

  it('normalizes missing and blank values to null', () => {
    const resource = formatAPIResource(
      hit({ name: '', license: null, keywords: '', distribution: '' }),
    );

    expect(resource?.name).toBeNull();
    expect(resource?.license).toBeNull();
    expect(resource?.keywords).toBeNull();
    expect(resource?.distribution).toBeNull();
    expect(resource?.isAccessibleForFree).toBeNull();
    expect(resource?.author).toBeNull();
  });

  it('wraps single values in an array', () => {
    const resource = formatAPIResource(
      hit({
        keywords: 'influenza',
        author: { name: 'Ada Lovelace', '@type': 'Person' },
        distribution: 'https://example.org/data.csv',
      }),
    );

    expect(resource?.id).toBe('abc123');
    expect(resource?.keywords).toEqual(['influenza']);
    expect(resource?.author).toEqual([
      expect.objectContaining({ name: 'Ada Lovelace', type: 'Person' }),
    ]);
    expect(resource?.distribution).toEqual([
      expect.objectContaining({ contentUrl: 'https://example.org/data.csv' }),
    ]);
  });

  it('formats inLanguage given as a bare name or an object', () => {
    expect(formatAPIResource(hit({ inLanguage: 'en' }))?.inLanguage).toEqual({
      alternateName: null,
      name: 'en',
    });
    expect(
      formatAPIResource(hit({ inLanguage: { name: 'English' } }))?.inLanguage,
    ).toEqual({ alternateName: null, name: 'English' });
  });
});
