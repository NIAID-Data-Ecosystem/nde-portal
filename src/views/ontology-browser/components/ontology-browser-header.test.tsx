import React from 'react';
import { render, screen } from 'src/__tests__/utils/render';

import { OntologyBrowserHeader } from './ontology-browser-header';

const HUMAN = {
  id: '9606',
  commonName: 'human',
  hasChildren: true,
  iri: 'http://purl.obolibrary.org/obo/NCBITaxon_9606',
  label: 'Homo sapiens',
  ontologyName: 'ncbitaxon',
  parentTaxonId: '9605',
  state: { opened: false, selected: true },
  taxonId: '9606',
};

describe('OntologyBrowserHeader', () => {
  it('renders nothing until a term is selected', () => {
    render(<OntologyBrowserHeader selectedNode={null} />);

    expect(
      screen.queryByText(/selected taxonomy term/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows the selected term', () => {
    render(<OntologyBrowserHeader selectedNode={HUMAN} />);

    expect(screen.getByText(/selected taxonomy term/i)).toBeInTheDocument();
    expect(screen.getByText('Homo sapiens')).toBeInTheDocument();
  });

  it('links to the term in the NCBI Taxonomy browser in a new tab', () => {
    render(<OntologyBrowserHeader selectedNode={HUMAN} />);

    const link = screen.getByRole('link', {
      name: /view ncbi classification/i,
    });
    expect(link).toHaveAttribute(
      'href',
      'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=9606',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
