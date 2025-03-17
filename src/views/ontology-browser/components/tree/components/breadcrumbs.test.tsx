import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { OntologyLineageItemWithCounts } from '../../../types';
import { OntologyTreeBreadcrumbs } from './breadcrumbs';

describe('OntologyTreeBreadcrumbs Component', () => {
  const mockLineageNodes: OntologyLineageItemWithCounts[] = [
    {
      id: '1',
      commonName: '',
      hasChildren: true,
      iri: 'http://purl.obolibrary.org/obo/NCBITaxon_1',
      label: 'root',
      ontologyName: 'ncbitaxon',
      parentTaxonId: null,
      state: {
        opened: true,
        selected: false,
      },
      taxonId: '1',
      counts: {
        termCount: 0,
        termAndChildrenCount: 30,
      },
    },
    {
      id: '10239',
      commonName: '',
      hasChildren: true,
      iri: 'http://purl.obolibrary.org/obo/NCBITaxon_10239',
      label: 'viruses',
      ontologyName: 'ncbitaxon',
      parentTaxonId: '1',
      state: {
        opened: true,
        selected: false,
      },
      taxonId: '10239',
      counts: {
        termCount: 751,
        termAndChildrenCount: 755,
      },
    },
    {
      id: '2559587',
      commonName: ['rna viruses and viroids', 'rna viruses'],
      hasChildren: true,
      iri: 'http://purl.obolibrary.org/obo/NCBITaxon_2559587',
      label: 'riboviria',
      ontologyName: 'ncbitaxon',
      parentTaxonId: '10239',
      state: {
        opened: true,
        selected: false,
      },
      taxonId: '2559587',
      counts: {
        termCount: 67,
        termAndChildrenCount: 71,
      },
    },
    {
      id: '2732396',
      commonName: '',
      hasChildren: true,
      iri: 'http://purl.obolibrary.org/obo/NCBITaxon_2732396',
      label: 'orthornavirae',
      ontologyName: 'ncbitaxon',
      parentTaxonId: '2559587',
      state: {
        opened: true,
        selected: false,
      },
      taxonId: '2732396',
      counts: {
        termCount: 0,
        termAndChildrenCount: 4,
      },
    },
    {
      id: '2732408',
      commonName: '',
      hasChildren: true,
      iri: 'http://purl.obolibrary.org/obo/NCBITaxon_2732408',
      label: 'pisuviricota',
      ontologyName: 'ncbitaxon',
      parentTaxonId: '2732396',
      state: {
        opened: true,
        selected: false,
      },
      taxonId: '2732408',
      counts: {
        termCount: 0,
        termAndChildrenCount: 4,
      },
    },
    {
      id: '2732506',
      commonName: '',
      hasChildren: true,
      iri: 'http://purl.obolibrary.org/obo/NCBITaxon_2732506',
      label: 'pisoniviricetes',
      ontologyName: 'ncbitaxon',
      parentTaxonId: '2732408',
      state: {
        opened: true,
        selected: false,
      },
      taxonId: '2732506',
      counts: {
        termCount: 0,
        termAndChildrenCount: 4,
      },
    },
    {
      id: '464095',
      commonName: '',
      hasChildren: true,
      iri: 'http://purl.obolibrary.org/obo/NCBITaxon_464095',
      label: 'picornavirales',
      ontologyName: 'ncbitaxon',
      parentTaxonId: '2732506',
      state: {
        opened: true,
        selected: false,
      },
      taxonId: '464095',
      counts: {
        termCount: 4,
        termAndChildrenCount: 4,
      },
    },
    {
      id: '11974',
      commonName: '',
      hasChildren: true,
      iri: 'http://purl.obolibrary.org/obo/NCBITaxon_11974',
      label: 'caliciviridae',
      ontologyName: 'ncbitaxon',
      parentTaxonId: '464095',
      state: {
        opened: true,
        selected: false,
      },
      taxonId: '11974',
      counts: {
        termCount: 2,
        termAndChildrenCount: 2,
      },
    },
  ];

  const mockUpdateShowFromIndex = jest.fn();

  it('renders lineage nodes as buttons', () => {
    render(
      <OntologyTreeBreadcrumbs
        lineageNodes={mockLineageNodes}
        showFromIndex={0}
        updateShowFromIndex={mockUpdateShowFromIndex}
      />,
    );

    mockLineageNodes.forEach(node => {
      expect(screen.getByText(node.label)).toBeInTheDocument();
    });
  });

  it('calls updateShowFromIndex when a node button is clicked', () => {
    render(
      <OntologyTreeBreadcrumbs
        lineageNodes={mockLineageNodes}
        showFromIndex={0}
        updateShowFromIndex={mockUpdateShowFromIndex}
      />,
    );

    fireEvent.click(screen.getByText('viruses'));
    expect(mockUpdateShowFromIndex).toHaveBeenCalledWith(1);
  });

  it('renders the "Show parent" button and calls updateShowFromIndex when clicked', () => {
    render(
      <OntologyTreeBreadcrumbs
        lineageNodes={mockLineageNodes}
        showFromIndex={8}
        updateShowFromIndex={mockUpdateShowFromIndex}
      />,
    );

    const showParentButton = screen.getByLabelText('show parent node');
    expect(showParentButton).toBeInTheDocument();

    fireEvent.click(showParentButton);
    expect(mockUpdateShowFromIndex).toHaveBeenCalledWith(7);
  });

  it('disables "Show parent" button when the selected node is the root node', () => {
    render(
      <OntologyTreeBreadcrumbs
        lineageNodes={mockLineageNodes}
        showFromIndex={0}
        updateShowFromIndex={mockUpdateShowFromIndex}
      />,
    );

    const showParentButton = screen.getByLabelText('show parent node');
    fireEvent.click(showParentButton);
    expect(mockUpdateShowFromIndex).toHaveBeenCalledWith(0);
  });
});
