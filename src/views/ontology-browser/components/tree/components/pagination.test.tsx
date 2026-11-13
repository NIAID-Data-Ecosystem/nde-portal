import '@testing-library/jest-dom/extend-expect';

import React from 'react';
import { fireEvent, render, screen } from 'src/__tests__/utils/render';
import { OntologyLineageItemWithCounts } from 'src/views/ontology-browser/types';

import { Pagination } from './pagination';

const mockNode: OntologyLineageItemWithCounts = {
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
};

describe('Pagination Component', () => {
  test('displays correct number of children', () => {
    render(
      <Pagination
        hasMore={false}
        disabled={false}
        loading={false}
        node={mockNode}
        numChildrenDisplayed={5}
        onShowMore={() => {}}
        totalElements={10}
      />,
    );
    expect(screen.getByText(/Displaying 5 of 10/)).toBeInTheDocument();
  });

  test('displays "Show more" button when hasMore is true', () => {
    render(
      <Pagination
        hasMore={true}
        disabled={false}
        loading={false}
        node={mockNode}
        numChildrenDisplayed={5}
        onShowMore={() => {}}
        totalElements={10}
      />,
    );
    expect(screen.getByText(/Show more/)).toBeInTheDocument();
  });

  test('does not display "Show more" button when hasMore is false', () => {
    render(
      <Pagination
        hasMore={false}
        disabled={false}
        loading={false}
        node={mockNode}
        numChildrenDisplayed={5}
        onShowMore={() => {}}
        totalElements={10}
      />,
    );
    expect(screen.queryByText(/Show more/)).not.toBeInTheDocument();
  });

  test('calls onShowMore when "Show more" button is clicked', () => {
    const onShowMoreMock = jest.fn();
    render(
      <Pagination
        hasMore={true}
        disabled={false}
        loading={false}
        node={mockNode}
        numChildrenDisplayed={5}
        onShowMore={onShowMoreMock}
        totalElements={10}
      />,
    );
    fireEvent.click(screen.getByText(/Show more/));
    expect(onShowMoreMock).toHaveBeenCalled();
  });

  test('"Show more" button is disabled when disabled is true', () => {
    render(
      <Pagination
        hasMore={true}
        disabled={true}
        loading={false}
        node={mockNode}
        numChildrenDisplayed={5}
        onShowMore={() => {}}
        totalElements={10}
      />,
    );
    expect(screen.getByText(/Show more/)).toBeDisabled();
  });

  test('"Show more" button shows loading state when loading is true', () => {
    render(
      <Pagination
        hasMore={true}
        disabled={false}
        loading={true}
        node={mockNode}
        numChildrenDisplayed={5}
        onShowMore={() => {}}
        totalElements={10}
      />,
    );
    expect(screen.getByText(/Show more/)).toBeInTheDocument();
    const buttonEl = screen.getByRole('button', { name: /Show more/ });
    expect(buttonEl).toHaveAttribute('data-loading');
    expect(buttonEl).toBeDisabled();
  });
});
