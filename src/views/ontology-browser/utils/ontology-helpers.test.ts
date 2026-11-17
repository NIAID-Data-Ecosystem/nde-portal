import { OntologyLineageItemWithCounts } from '../types';
import {
  getChildren,
  mergePreviousLineageWithChildrenData,
  sortChildrenList,
} from './ontology-helpers';

const makeNode = (
  taxonId: string,
  parentTaxonId: string | null,
  counts?: OntologyLineageItemWithCounts['counts'],
): OntologyLineageItemWithCounts => ({
  id: taxonId,
  commonName: '',
  hasChildren: false,
  iri: `http://purl.obolibrary.org/obo/NCBITaxon_${taxonId}`,
  label: `taxon ${taxonId}`,
  ontologyName: 'ncbitaxon',
  parentTaxonId,
  state: { opened: false, selected: false },
  taxonId,
  counts,
});

const taxonIds = (nodes: OntologyLineageItemWithCounts[]) =>
  nodes.map(node => node.taxonId);

describe('getChildren', () => {
  const lineage = [
    makeNode('1', null),
    makeNode('9605', '1'),
    makeNode('9606', '9605'),
    makeNode('1425170', '9605'),
  ];

  it('returns the nodes whose parent is the given taxon', () => {
    expect(taxonIds(getChildren('9605', lineage))).toEqual(['9606', '1425170']);
  });

  it('returns nothing for a leaf', () => {
    expect(getChildren('9606', lineage)).toEqual([]);
  });

  it('does not treat the root as a child', () => {
    expect(taxonIds(getChildren('1', lineage))).toEqual(['9605']);
  });
});

describe('sortChildrenList', () => {
  it('sorts by term count, highest first', () => {
    const sorted = sortChildrenList([
      makeNode('a', '1', { termCount: 1 }),
      makeNode('b', '1', { termCount: 30 }),
      makeNode('c', '1', { termCount: 7 }),
    ]);

    expect(taxonIds(sorted)).toEqual(['b', 'c', 'a']);
  });

  it('keeps the original order for equal term counts', () => {
    const sorted = sortChildrenList([
      makeNode('a', '1', { termCount: 2, termAndChildrenCount: 2 }),
      makeNode('b', '1', { termCount: 2, termAndChildrenCount: 90 }),
    ]);

    expect(taxonIds(sorted)).toEqual(['a', 'b']);
  });

  it('leaves nodes without counts in place', () => {
    const sorted = sortChildrenList([
      makeNode('a', '1'),
      makeNode('b', '1'),
      makeNode('c', '1'),
    ]);

    expect(taxonIds(sorted)).toEqual(['a', 'b', 'c']);
  });
});

describe('mergePreviousLineageWithChildrenData', () => {
  const lineage = [makeNode('1', null), makeNode('9605', '1')];

  it('returns an empty lineage when there is no previous lineage', () => {
    expect(
      mergePreviousLineageWithChildrenData(null, [makeNode('9606', '9605')]),
    ).toEqual([]);
  });

  it('appends children that are not in the lineage yet', () => {
    const merged = mergePreviousLineageWithChildrenData(lineage, [
      makeNode('9605', '1'),
      makeNode('9606', '9605'),
    ]);

    expect(taxonIds(merged)).toEqual(['1', '9605', '9606']);
  });

  /*
  Returning the same array lets React bail out of the state update in the
  browser's `setLineage(prev => merge(prev, children))`.
  */
  it('returns the previous lineage itself when nothing is new', () => {
    expect(mergePreviousLineageWithChildrenData(lineage, [])).toBe(lineage);
    expect(
      mergePreviousLineageWithChildrenData(lineage, [makeNode('9605', '1')]),
    ).toBe(lineage);
  });
});
