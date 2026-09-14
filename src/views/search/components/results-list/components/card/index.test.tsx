import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import SearchResultCard from '.';

jest.mock('@react-spring/web', () => ({
  useInView: () => [{ current: null }, true],
}));

jest.mock('src/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, login: jest.fn() }),
}));

jest.mock('src/hooks/useUserData', () => ({
  useUserData: () => ({
    savedDatasets: [],
    addSavedDataset: jest.fn(),
    removeSavedDataset: jest.fn(),
  }),
}));

// Mock UI elements unrelated to the collection-size rectangle.
jest.mock('./metadata-accordion', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('src/components/source-logo', () => ({
  SourceLogo: {
    Wrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Component: () => null,
  },
}));
jest.mock('src/components/resource-sections/components', () => ({
  TypeBanner: () => null,
}));
jest.mock('./operating-systems', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('src/components/badges', () => ({
  AccessibleForFree: () => null,
  ConditionsOfAccess: () => null,
}));
jest.mock('src/components/searchable-items', () => ({
  SearchableItems: () => null,
  SearchableItem: () => null,
}));
jest.mock('src/components/html-content', () => ({
  DisplayHTMLContent: () => null,
}));
jest.mock('src/components/toggle-container', () => ({
  ToggleContainer: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
jest.mock('src/components/metadata-completeness-badge/Circular', () => ({
  CompletenessBadgeCircle: () => <div data-testid='completeness-badge' />,
}));

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

const makeData = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'abc123',
    '@type': 'Dataset',
    name: 'A record',
    ...overrides,
  } as any);

describe('collection size rectangle', () => {
  it('renders the rectangle with formatted count/unitText for a DataCollection, not the completeness badge', () => {
    renderWithChakra(
      <SearchResultCard
        querystring='__all__'
        data={makeData({
          '@type': 'DataCollection',
          collectionSize: [{ value: 42, unitText: 'genomes' }],
        })}
      />,
    );

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('genomes')).toBeInTheDocument();
    expect(screen.getByText('in this collection')).toBeInTheDocument();
    expect(screen.queryByTestId('completeness-badge')).not.toBeInTheDocument();
  });

  it('reveals the tooltip label on hover of the rectangle', async () => {
    const user = userEvent.setup();
    renderWithChakra(
      <SearchResultCard
        querystring='__all__'
        data={makeData({
          '@type': 'DataCollection',
          collectionSize: [{ value: 42, unitText: 'genomes' }],
        })}
      />,
    );

    await user.hover(screen.getByText('42'));

    expect(
      await screen.findByText(
        'Type and number of items in the data collection',
      ),
    ).toBeInTheDocument();
  });

  it('renders the completeness badge, not the rectangle, when @type is not DataCollection', () => {
    renderWithChakra(
      <SearchResultCard
        querystring='__all__'
        data={makeData({
          '@type': 'Dataset',
          collectionSize: [{ value: 42, unitText: 'genomes' }],
        })}
      />,
    );

    expect(screen.getByTestId('completeness-badge')).toBeInTheDocument();
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });

  it('renders neither the rectangle nor the completeness badge when collectionSize does not format to a value', () => {
    renderWithChakra(
      <SearchResultCard
        querystring='__all__'
        data={makeData({
          '@type': 'DataCollection',
          collectionSize: [{ value: 42 }], // missing unitText
        })}
      />,
    );

    expect(screen.queryByText('42')).not.toBeInTheDocument();
    expect(screen.queryByTestId('completeness-badge')).not.toBeInTheDocument();
  });
});
