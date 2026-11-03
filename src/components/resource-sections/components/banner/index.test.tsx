import React from 'react';
import { render, screen } from 'src/__tests__/utils/render';
import { FormattedResource } from 'src/utils/api/types';

import ResourceBanner from '.';

const makeResource = (overrides: Record<string, unknown> = {}) =>
  ({
    '@type': 'Dataset',
    date: null,
    dateCreated: null,
    dateModified: null,
    datePublished: null,
    includedInDataCatalog: { name: 'Figshare' },
    ...overrides,
  } as FormattedResource);

describe('ResourceBanner', () => {
  it('renders nothing without data', () => {
    const { container } = render(<ResourceBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the type label followed by the dates', () => {
    render(
      <ResourceBanner
        data={makeResource({ date: '2024-05-01', datePublished: '2024-01-01' })}
      />,
    );

    expect(screen.getByText('Dataset')).toBeInTheDocument();
    expect(screen.getByText('2024-05-01')).toHaveTextContent(/^2024-05-01$/);
    expect(screen.getByText('2024-01-01')).toHaveTextContent(
      'Published 2024-01-01',
    );
  });

  it('names the operating systems a computational tool supports', () => {
    render(
      <ResourceBanner
        data={makeResource({
          '@type': 'ComputationalTool',
          operatingSystem: ['Mac', 'Linux', 'Solaris'],
        })}
      />,
    );

    expect(
      screen.getByRole('img', {
        name: 'Operating systems supported: Mac, Linux, Solaris',
      }),
    ).toBeInTheDocument();
  });

  it('ignores operating systems on other types', () => {
    render(
      <ResourceBanner data={makeResource({ operatingSystem: ['Mac'] })} />,
    );

    expect(
      screen.queryByRole('img', { name: /operating systems/i }),
    ).not.toBeInTheDocument();
  });

  it('marks resources from NIAID-funded sources', () => {
    render(
      <ResourceBanner
        data={makeResource({ includedInDataCatalog: [{ name: 'ImmPort' }] })}
      />,
    );

    expect(screen.getByText('NIAID')).toBeInTheDocument();
  });

  it('labels a resource catalog with a source organization as a program resource', () => {
    render(
      <ResourceBanner
        data={makeResource({
          '@type': 'ResourceCatalog',
          sourceOrganization: [{ name: 'A program' }],
        })}
      />,
    );

    expect(screen.getByText('Program Resource')).toBeInTheDocument();
  });
});
