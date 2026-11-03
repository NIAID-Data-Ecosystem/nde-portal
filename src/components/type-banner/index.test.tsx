import userEvent from '@testing-library/user-event';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import React from 'react';
import { render, screen } from 'src/__tests__/utils/render';

import TypeBanner from '.';

describe('TypeBanner', () => {
  it('renders the type label and any children', () => {
    render(
      <TypeBanner label='Dataset' type='Dataset'>
        <span>child content</span>
      </TypeBanner>,
    );

    expect(screen.getByText('Dataset')).toBeInTheDocument();
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('replaces the type label with the program label', () => {
    render(
      <TypeBanner
        label='Resource Catalog'
        type='ResourceCatalog'
        programVariant='info-and-resource'
      />,
    );

    expect(screen.getByText('Program Info and Resource')).toBeInTheDocument();
    expect(screen.queryByText('Resource Catalog')).not.toBeInTheDocument();
  });

  it('falls back to "Unknown" when there is no label', () => {
    render(<TypeBanner label='' type='Dataset' />);

    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('shows the NIAID label only for NIAID-funded resources', () => {
    const { rerender } = render(<TypeBanner label='Dataset' type='Dataset' />);
    expect(screen.queryByText('NIAID')).not.toBeInTheDocument();

    rerender(<TypeBanner label='Dataset' type='Dataset' isNiaidFunded />);
    expect(screen.getByText('NIAID')).toBeInTheDocument();
  });

  it('explains the type in a tooltip on hover', async () => {
    render(<TypeBanner label='Dataset' type='Dataset' />);

    await userEvent.setup().hover(screen.getByText('Dataset'));

    expect(
      await screen.findByRole('tooltip', {}, { timeout: 2000 }),
    ).toHaveTextContent(SCHEMA_DEFINITIONS['@type'].abstract.Dataset);
  });
});
