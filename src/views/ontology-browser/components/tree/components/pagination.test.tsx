import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Pagination } from './pagination';
import { OntologyLineageItemWithCounts } from 'src/views/ontology-browser/types';

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
        isDisabled={false}
        isLoading={false}
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
        isDisabled={false}
        isLoading={false}
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
        isDisabled={false}
        isLoading={false}
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
        isDisabled={false}
        isLoading={false}
        node={mockNode}
        numChildrenDisplayed={5}
        onShowMore={onShowMoreMock}
        totalElements={10}
      />,
    );
    fireEvent.click(screen.getByText(/Show more/));
    expect(onShowMoreMock).toHaveBeenCalled();
  });

  test('"Show more" button is disabled when isDisabled is true', () => {
    render(
      <Pagination
        hasMore={true}
        isDisabled={true}
        isLoading={false}
        node={mockNode}
        numChildrenDisplayed={5}
        onShowMore={() => {}}
        totalElements={10}
      />,
    );
    expect(screen.getByText(/Show more/)).toBeDisabled();
  });

  test('"Show more" button shows loading state when isLoading is true', () => {
    render(
      <Pagination
        hasMore={true}
        isDisabled={false}
        isLoading={true}
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
