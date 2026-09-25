import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { DiseaseOverviewCard } from 'src/views/search/components/results-list/components/carousel-compact-card/disease-overview-card';

// The real `CompactCard`is rendered and its heavy leaf dependencies are
// stubbed. TypeBanner pulls in logos/images and Skeleton has async/animated
// behaviour, so both are replaced with light stubs. `react-markdown` is left
// real.
jest.mock('src/components/resource-sections/components', () => ({
  TypeBanner: ({ label, type }: any) => (
    <div data-testid='type-banner' data-label={label} data-type={type} />
  ),
}));

jest.mock('src/components/skeleton', () => ({
  Skeleton: ({ children }: any) => <div data-testid='skeleton'>{children}</div>,
}));

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

describe('DiseaseOverviewCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('missing slug guard', () => {
    it('renders nothing and warns when there is no slug and not loading', () => {
      // The component treats a missing slug as a data problem: it logs a
      // warning and returns null.
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      renderWithChakra(
        <DiseaseOverviewCard data={{ title: 'Influenza' } as any} />,
      );

      // The component returns null, so none of the card scaffold renders.
      expect(screen.queryByTestId('type-banner')).not.toBeInTheDocument();
      expect(warnSpy).toHaveBeenCalledWith(
        'DiseaseOverviewCard: Missing slug for disease overview card',
        expect.objectContaining({ title: 'Influenza' }),
      );

      warnSpy.mockRestore();
    });

    it('renders (does not warn) while loading even without a slug', () => {
      // When isLoading is true the guard is skipped, so the card renders its
      // skeleton/banner scaffold while data is still arriving.
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      renderWithChakra(<DiseaseOverviewCard isLoading />);

      expect(warnSpy).not.toHaveBeenCalled();
      const banner = screen.getByTestId('type-banner');
      expect(banner).toHaveAttribute('data-type', 'Disease');
      expect(banner).toHaveAttribute('data-label', 'Disease Overview');

      warnSpy.mockRestore();
    });
  });

  describe('title and link', () => {
    it('renders the title inside a link built from the slug', () => {
      // When a slug exists the Title receives linkProps, so the title becomes a
      // link. The global next/link mock renders the object href's pathname
      // ('/diseases/[slug]') as the anchor href.
      renderWithChakra(
        <DiseaseOverviewCard
          data={{ title: 'Influenza', slug: 'influenza' } as any}
        />,
      );

      const link = screen.getByRole('link', { name: /influenza/i });
      expect(link).toHaveAttribute('href', '/diseases/[slug]');
    });
  });

  describe('invitation text', () => {
    it('includes the disease title when present', () => {
      renderWithChakra(
        <DiseaseOverviewCard
          data={{ title: 'Influenza', slug: 'influenza' } as any}
        />,
      );
      expect(
        screen.getByText(
          'Learn about Influenza resources in the NIAID Data Ecosystem.',
        ),
      ).toBeInTheDocument();
    });

    it('falls back to a generic invitation when there is no title', () => {
      // slug present (so the guard passes) but no title: generic wording.
      renderWithChakra(
        <DiseaseOverviewCard data={{ slug: 'influenza' } as any} />,
      );
      expect(
        screen.getByText('Learn about resources in the NIAID Data Ecosystem.'),
      ).toBeInTheDocument();
    });
  });

  describe('description branches', () => {
    it('renders the plain description followed by the invitation', () => {
      renderWithChakra(
        <DiseaseOverviewCard
          data={
            {
              title: 'Influenza',
              slug: 'influenza',
              description: 'A respiratory illness overview.',
            } as any
          }
        />,
      );
      expect(
        screen.getByText('A respiratory illness overview.'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Learn about Influenza resources in the NIAID Data Ecosystem.',
        ),
      ).toBeInTheDocument();
    });

    it('prefers topicEmphasizedDescription (markdown) over description', () => {
      // `topicEmphasizedDescription || description`: when the emphasized
      // version exists it is rendered via ReactMarkdown and the plain
      // description is not shown at all. Plain text (no markdown syntax)
      // renders as a single node.
      renderWithChakra(
        <DiseaseOverviewCard
          data={
            {
              title: 'Influenza',
              slug: 'influenza',
              description: 'Plain description text.',
              topicEmphasizedDescription: 'Emphasized topic description.',
            } as any
          }
        />,
      );
      expect(
        screen.getByText('Emphasized topic description.'),
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Plain description text.'),
      ).not.toBeInTheDocument();
    });

    it('renders only the invitation when there is no description', () => {
      renderWithChakra(
        <DiseaseOverviewCard
          data={{ title: 'Influenza', slug: 'influenza' } as any}
        />,
      );
      expect(
        screen.getByText(
          'Learn about Influenza resources in the NIAID Data Ecosystem.',
        ),
      ).toBeInTheDocument();
    });
  });
});
