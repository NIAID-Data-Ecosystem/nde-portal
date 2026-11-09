import { getProgramResourceVariant, PROGRAM_COLLECTIONS_SAMEAS_STUB } from '.';

const sourceOrganization = [{ name: 'A program' }] as any;

describe('getProgramResourceVariant', () => {
  it('returns undefined when there is no sourceOrganization', () => {
    expect(
      getProgramResourceVariant({ '@type': 'ResourceCatalog' }),
    ).toBeUndefined();
    expect(
      getProgramResourceVariant({
        '@type': 'ResourceCatalog',
        sourceOrganization: [],
      }),
    ).toBeUndefined();
  });

  it('returns undefined for non-ResourceCatalog types', () => {
    expect(
      getProgramResourceVariant({ '@type': 'Dataset', sourceOrganization }),
    ).toBeUndefined();
  });

  it('returns "resource" when sameAs does not link to a program collection', () => {
    expect(
      getProgramResourceVariant({
        '@type': 'ResourceCatalog',
        sourceOrganization,
      }),
    ).toBe('resource');
    expect(
      getProgramResourceVariant({
        '@type': 'ResourceCatalog',
        sourceOrganization,
        sameAs: 'https://example.org/program',
      }),
    ).toBe('resource');
  });

  it('returns "info-and-resource" when sameAs links to a program collection', () => {
    expect(
      getProgramResourceVariant({
        '@type': 'ResourceCatalog',
        sourceOrganization,
        sameAs: `${PROGRAM_COLLECTIONS_SAMEAS_STUB}a-program`,
      }),
    ).toBe('info-and-resource');
  });

  it('handles sameAs arrays', () => {
    expect(
      getProgramResourceVariant({
        '@type': 'ResourceCatalog',
        sourceOrganization,
        sameAs: [
          'https://example.org/program',
          `${PROGRAM_COLLECTIONS_SAMEAS_STUB}a-program`,
        ],
      }),
    ).toBe('info-and-resource');
  });
});
