import React from 'react';
import { render, screen } from 'src/__tests__/utils/render';

import {
  getTooltipContentByCountType,
  OntologyBrowserCountTag,
} from './ontology-browser-count-tag';

describe('getTooltipContentByCountType', () => {
  it.each([
    [
      'termCount',
      'Number of datasets for this term in the NIAID Discovery Portal',
    ],
    [
      'termAndChildrenCount',
      'Number of datasets for this term and sub-terms in the NIAID Discovery Portal',
    ],
  ] as const)('describes %s', (type, description) => {
    const { container } = render(<>{getTooltipContentByCountType(type)}</>);

    expect(container).toHaveTextContent(description);
  });
});

describe('OntologyBrowserCountTag', () => {
  it('shows the count', () => {
    render(
      <OntologyBrowserCountTag tooltipLabel='Exact matches'>
        1,234
      </OntologyBrowserCountTag>,
    );

    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('shows a spinner instead of the count while loading', () => {
    const { container } = render(
      <OntologyBrowserCountTag tooltipLabel='Exact matches' loading>
        1,234
      </OntologyBrowserCountTag>,
    );

    expect(screen.queryByText('1,234')).not.toBeInTheDocument();
    // v3's Spinner has no role, so match the class the a11y spec also uses.
    expect(container.querySelector('.chakra-spinner')).toBeInTheDocument();
  });
});
