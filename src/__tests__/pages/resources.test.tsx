import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithClient } from 'src/__tests__/mocks/utils';
import ResourcePage from 'src/pages/resources';
import { getResourceById } from 'src/utils/api';

const mockPush = jest.fn();
const mockRouterState: { query: Record<string, string> } = { query: {} };

// The page redirects by calling router.push during render. next-router-mock
// (wired up globally in jest.setup.js) re-renders on push, which turns that
// into an infinite render loop, so use an inert router here instead.
jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => ({
    query: mockRouterState.query,
    isReady: true,
    push: mockPush,
    reload: jest.fn(),
  }),
}));

jest.mock('src/utils/api', () => ({
  getResourceById: jest.fn(),
}));

// PageContainer mounts the navigation bar (and its AuthProvider dependency),
// which is irrelevant here — stub it to passthrough wrappers.
jest.mock('src/components/page-container', () => ({
  getPageSeoConfig: () => ({}),
  PageContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PageContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('src/views/saved/components/saved-data-error-toast', () => ({
  SavedDataErrorToast: () => null,
}));

// Sections/Sidebar are exercised by their own tests — here they only need to
// report which sections the page decided to hand them.
jest.mock('src/components/resource-sections', () => ({
  __esModule: true,
  default: ({ sections }: { sections: { hash: string }[] }) => (
    <div data-testid='sections'>
      {sections.map(section => section.hash).join(',')}
    </div>
  ),
}));

jest.mock('src/components/resource-sections/components/sidebar', () => ({
  Sidebar: ({ sections }: { sections: { hash: string }[] }) => (
    <div data-testid='sidebar'>
      {sections.map(section => section.hash).join(',')}
    </div>
  ),
}));

// A trimmed section config: `exampleOfWork` is hidden from navigation so the
// page's sidebar filter has something to filter.
jest.mock('src/components/resource-sections/resource-sections', () => ({
  RESOURCE_SECTIONS: {
    title: 'Sections',
    routes: [
      {
        title: 'Overview',
        hash: 'overview',
        properties: ['about'],
        ui: {
          isCollapsible: true,
          showInNavigation: true,
          showEmptyState: true,
        },
      },
      {
        title: 'Description',
        hash: 'description',
        properties: ['description'],
        ui: {
          isCollapsible: true,
          showInNavigation: true,
          showEmptyState: false,
        },
      },
      {
        title: 'Example of Work',
        hash: 'exampleOfWork',
        properties: ['exampleOfWork.schemaVersion'],
        ui: {
          isCollapsible: true,
          showInNavigation: false,
          showEmptyState: false,
        },
      },
      {
        title: 'Samples',
        hash: 'samples',
        properties: ['sample'],
        ui: {
          isCollapsible: true,
          showInNavigation: true,
          showEmptyState: false,
        },
      },
    ],
  },
}));

jest.mock('src/utils/feature-flags', () => ({
  __esModule: true,
  SHOULD_HIDE_SAMPLES: jest.fn(() => false),
  SHOW_DATA_COLLECTIONS_TAB: true,
}));

const featureFlags = jest.requireMock('src/utils/feature-flags');
const mockGetResourceById = getResourceById as jest.Mock;

const makeResource = (overrides: Record<string, unknown> = {}) => ({
  _id: 'abc123',
  '@type': 'Dataset',
  name: 'A resource',
  description: 'A description.',
  rawData: { _id: 'abc123', name: 'A resource' },
  ...overrides,
});

const getSectionHashes = (testId: 'sections' | 'sidebar') =>
  screen.getByTestId(testId).textContent?.split(',').filter(Boolean) ?? [];

// Sections render before the query resolves (with every route visible), so
// wait on the resolved list rather than on the elements being present.
const waitForSections = async (expected: string[]) =>
  waitFor(() => expect(getSectionHashes('sections')).toEqual(expected));

describe('ResourcePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    featureFlags.SHOW_DATA_COLLECTIONS_TAB = true;
    featureFlags.SHOULD_HIDE_SAMPLES.mockImplementation(() => false);
    mockRouterState.query = { id: 'abc123' };
  });

  it('only renders sections whose metadata is present', async () => {
    mockGetResourceById.mockResolvedValue(makeResource({ about: null }));

    renderWithClient(<ResourcePage />);

    // `overview` has showEmptyState, so it stays even with no `about`;
    // `exampleOfWork` and `samples` have no data and no empty state.
    await waitForSections(['overview', 'description']);
  });

  it('excludes sections hidden by SHOULD_HIDE_SAMPLES', async () => {
    featureFlags.SHOULD_HIDE_SAMPLES.mockImplementation(
      (hash: string) => hash === 'samples',
    );
    mockGetResourceById.mockResolvedValue(
      makeResource({ sample: { '@type': 'Sample' } }),
    );

    renderWithClient(<ResourcePage />);

    await waitForSections(['overview', 'description']);
  });

  it('passes only navigation-visible sections to the sidebar', async () => {
    mockGetResourceById.mockResolvedValue(
      makeResource({
        exampleOfWork: { schemaVersion: 'https://example.com/v1' },
      }),
    );

    renderWithClient(<ResourcePage />);

    await waitForSections(['overview', 'description', 'exampleOfWork']);
    expect(getSectionHashes('sidebar')).toEqual(['overview', 'description']);
  });

  describe('DataCollection resources', () => {
    it('hides the description section, which is rendered separately', async () => {
      mockGetResourceById.mockResolvedValue(
        makeResource({ '@type': 'DataCollection' }),
      );

      renderWithClient(<ResourcePage />);

      await waitForSections(['overview']);
      expect(getSectionHashes('sidebar')).toEqual(['overview']);
    });

    it('keeps the description section for other resource types', async () => {
      mockGetResourceById.mockResolvedValue(
        makeResource({ '@type': 'Dataset' }),
      );

      renderWithClient(<ResourcePage />);

      await waitForSections(['overview', 'description']);
    });

    it('redirects to 404 when SHOW_DATA_COLLECTIONS_TAB is disabled', async () => {
      featureFlags.SHOW_DATA_COLLECTIONS_TAB = false;
      mockGetResourceById.mockResolvedValue(
        makeResource({ '@type': 'DataCollection' }),
      );

      renderWithClient(<ResourcePage />);

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/404'));
      expect(screen.queryByTestId('sections')).not.toBeInTheDocument();
    });

    it('renders normally when SHOW_DATA_COLLECTIONS_TAB is enabled', async () => {
      mockGetResourceById.mockResolvedValue(
        makeResource({ '@type': 'DataCollection' }),
      );

      renderWithClient(<ResourcePage />);

      await waitForSections(['overview']);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('redirects to 404 when no id is provided', async () => {
    mockRouterState.query = {};

    renderWithClient(<ResourcePage />);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/404'));
    expect(mockGetResourceById).not.toHaveBeenCalled();
  });

  it('redirects to 404 when no resource is found for the id', async () => {
    mockGetResourceById.mockResolvedValue(null);

    renderWithClient(<ResourcePage />);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/404'));
  });
});
