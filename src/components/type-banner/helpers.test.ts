import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';

import {
  getProgramResourceVariant,
  getTypeColors,
  getTypeDefinition,
  PROGRAM_COLLECTIONS_SAMEAS_STUB,
} from './helpers';

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

describe('getTypeColors', () => {
  it('matches types case-insensitively', () => {
    expect(getTypeColors('dataset')).toEqual(getTypeColors('Dataset'));
  });

  it('groups tool and software types together', () => {
    expect(getTypeColors('ComputationalTool')).toEqual(
      getTypeColors('SoftwareApplication'),
    );
  });

  it('falls back to the NIAID colours for other or missing types', () => {
    const fallback = { label: 'niaid.500', banner: 'niaid.500' };
    expect(getTypeColors('Sample')).toEqual(fallback);
    expect(getTypeColors()).toEqual(fallback);
  });

  it('overrides the type colours for program resources, and retired over both', () => {
    const program = getTypeColors('ResourceCatalog', { isProgram: true });
    const retired = getTypeColors('ResourceCatalog', { isRetired: true });

    expect(program).not.toEqual(getTypeColors('ResourceCatalog'));
    expect(retired).not.toEqual(program);
    expect(
      getTypeColors('ResourceCatalog', { isRetired: true, isProgram: true }),
    ).toEqual(retired);
  });
});

describe('getTypeDefinition', () => {
  it('returns the schema copy for a resource type', () => {
    expect(getTypeDefinition('Dataset')).toBe(
      SCHEMA_DEFINITIONS['@type'].abstract.Dataset,
    );
  });

  it('returns undefined for missing types or types the schema does not define', () => {
    expect(getTypeDefinition()).toBeUndefined();
    expect(getTypeDefinition('Disease')).toBeUndefined();
  });
});
