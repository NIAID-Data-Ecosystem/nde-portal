import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MetadataCompatibilitySourceBadge } from '../index';
import { MetadataSource } from 'src/hooks/api/types';
import { CompatibilityBadge, defaultMargin } from '../components/badge';

// Mock Tooltip component
jest.mock('src/components/tooltip-with-link', () => ({
  __esModule: true,
  default: ({
    children,
    label,
  }: {
    children: React.ReactNode;
    label: string;
  }) => (
    <div>
      {children}
      <span role='tooltip'>{label}</span>
    </div>
  ),
}));

describe('MetadataCompatibilitySourceBadge', () => {
  it('renders nothing when data is null or undefined', () => {
    const { container } = render(
      <MetadataCompatibilitySourceBadge data={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the TooltipWithLink and CompatibilityBadge components when data is provided', async () => {
    const mockData = {
      required_fields: { name: 1, description: 1, date: 1 },
      recommended_fields: { dateCreated: 1 },
      percent_required_fields: 0.9,
      percent_recommended_fields: 0.8,
    } as MetadataSource['sourceInfo']['metadata_completeness'];

    const { getByText } = render(
      <MetadataCompatibilitySourceBadge data={mockData} />,
    );

    const linkEl = getByText('Metadata Compatibility');
    expect(linkEl).toBeInTheDocument();

    fireEvent.mouseOver(linkEl);
    await waitFor(() => {});
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'The metadata compatibility badge is a quantitative measure that represents how well a repository aligns with the metadata standards of the NIAID Data Ecosystem.',
    );
  });
});

const mockData = {
  avg_augmented_recommended_ratio: 0,
  avg_augmented_required_ratio: 0,
  avg_recommended_score_ratio: 0.33,
  avg_required_ratio: 0.69,
  required_fields: {
    author: 1,
    date: 1,
    description: 1,
    distribution: 1,
    funding: 0.13,
    includedInDataCatalog: 1,
    measurementTechnique: 0,
    name: 1,
    url: 1,
  },
  recommended_fields: {
    citation: 0,
    citedBy: 0.1,
    dateCreated: 0,
    dateModified: 1,
    datePublished: 1,
    doi: 0.71,
    healthCondition: 0,
    infectiousAgent: 0,
    species: 0,
    variableMeasured: 0,
  },
  sum_required_coverage: 7.13,
  sum_recommended_coverage: 6.91,
  required_augmented_fields_coverage: {
    date: 1,
    funding: 0,
    measurementTechnique: 0,
  },
  recommended_augmented_fields_coverage: {
    citation: 0,
    healthCondition: 0,
    infectiousAgent: 0,
    species: 0,
    variableMeasured: 1,
  },
  binary_required_score: 8,
  binary_recommended_score: 9,
  binary_required_augmented: 0,
  binary_recommended_augmented: 0,
  percent_required_fields: 0.89,
  percent_recommended_fields: 0.43,
  conditionsOfAccess: 'Varied',
} as unknown as MetadataSource['sourceInfo']['metadata_completeness'];

describe('CompatibilityBadge', () => {
  it('renders nothing when width is less than 10', () => {
    const { container } = render(
      <CompatibilityBadge
        width={5}
        height={100}
        data={{} as MetadataSource['sourceInfo']['metadata_completeness']}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the heatmap', async () => {
    const { container } = render(
      <CompatibilityBadge width={500} height={500} data={mockData} />,
    );

    expect(container.querySelector('svg')).toBeInTheDocument();

    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);
  });

  it('shows the correct number of heatmap cells for required and recommended fields', () => {
    const { container } = render(
      <CompatibilityBadge width={500} height={500} data={mockData} />,
    );

    // 9 required fields + 10 recommended fields = 19 cells
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBe(19);
  });

  it('renders default margins if margin prop is not provided', () => {
    const [width, height] = [500, 500];
    const { container } = render(
      <CompatibilityBadge width={width} height={height} data={mockData} />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // / Check the position of the first Group element to ensure default margins are applied
    const groupEl = svg?.querySelector('g');
    const y = height / 2 - defaultMargin.bottom - defaultMargin.top;
    const x = defaultMargin.left;
    expect(groupEl).toHaveAttribute('transform', `translate(${x}, ${y})`);
  });

  it('renders custom margins when prop is provided', () => {
    const [width, height] = [500, 500];
    const margin = { top: 20, right: 10, bottom: 15, left: 5 };

    const { container } = render(
      <CompatibilityBadge
        width={width}
        height={height}
        data={mockData}
        margin={margin}
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // / Check the position of the first Group element to ensure custom margins are applied
    const groupEl = svg?.querySelector('g');
    const y = height / 2 - margin.bottom - margin.top;
    const x = margin.left;
    expect(groupEl).toHaveAttribute('transform', `translate(${x}, ${y})`);
  });

  it('handles case where required fields data is empty', () => {
    const mockData = {
      required_fields: {},
      recommended_fields: { dateCreated: 1 },
      percent_required_fields: 0,
      percent_recommended_fields: 0.8,
    } as MetadataSource['sourceInfo']['metadata_completeness'];

    const { container } = render(
      <CompatibilityBadge width={500} height={500} data={mockData} />,
    );

    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBe(1); // Should only have recommended field heatmap
  });

  test('displays tooltip on mouse hover for recommended fields', () => {
    const { container } = render(
      <CompatibilityBadge width={500} height={500} data={mockData} />,
    );

    // Select all rect elements within the .recommended-fields group
    const recommendedRects = container.querySelectorAll(
      '.recommended-fields .visx-heatmap-rect rect',
    );

    // Simulate mouse hover on the heatmap rect
    fireEvent.mouseMove(recommendedRects[0]);
    // Assert that the tooltip is visible
    expect(
      screen.getByText(/metadata was not found for this source./i),
    ).toBeInTheDocument();
  });

  test('displays tooltip on mouse hover for required fields', () => {
    const { container } = render(
      <CompatibilityBadge width={500} height={500} data={mockData} />,
    );

    // Select all rect elements within the .required-fields group
    const requiredRects = container.querySelectorAll(
      '.required-fields .visx-heatmap-rect rect',
    );

    // Simulate mouse hover on the heatmap rect
    fireEvent.mouseMove(requiredRects[0]);

    // Assert that the tooltip is visible
    expect(
      screen.getByText(/metadata is collected and available for this source./i),
    ).toBeInTheDocument();
  });

  it('handles augmented data display correctly', () => {
    const { container } = render(
      <CompatibilityBadge width={500} height={500} data={mockData} />,
    );

    // Select all rect elements within the .required-fields group
    const requiredRects = container.querySelectorAll(
      '.required-fields .visx-heatmap-rect rect',
    );

    // Simulate mouse hover on the heatmap rect
    fireEvent.mouseMove(requiredRects[1]);

    // Assert that the tooltip is visible
    expect(
      screen.getByText(/metadata is collected and available for this source./i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/was also augmented for this source./i),
    ).toBeInTheDocument();

    // Select all rect elements within the .recommended-fields group
    const recommendedRects = container.querySelectorAll(
      '.recommended-fields .visx-heatmap-rect rect',
    );

    // Simulate mouse hover on the heatmap rect
    fireEvent.mouseMove(recommendedRects[9]);

    // Assert that the tooltip is visible
    expect(
      screen.getByText(
        /metadata was not found for this source, but was augmented for this source./i,
      ),
    ).toBeInTheDocument();
  });

  it('clears tooltip on mouse leave', () => {
    render(<CompatibilityBadge width={500} height={500} data={mockData} />);

    const { container } = render(
      <CompatibilityBadge width={500} height={500} data={mockData} />,
    );

    const rects = container.querySelectorAll('rect');

    // Simulate mouse hover on the heatmap rect
    fireEvent.mouseMove(rects[0]);

    fireEvent.mouseLeave(rects[0]);

    const tooltip = screen.queryByText(/metadata is collected and available/i);
    expect(tooltip).not.toBeInTheDocument();
  });
});
