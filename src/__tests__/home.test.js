import HOMEPAGE_COPY from 'configs/homepage.json';
import HOME_QUERIES from 'configs/queries/home-queries.json';
import Home, { RepositoryTable, RepositoryTabs } from 'src/pages/index';
import { createWrapper } from './mocks/utils.tsx';
import { useRepoData } from 'src/hooks/api';
import {
  renderHook,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
  act,
} from '@testing-library/react';
import { server } from '../../jest.setup.js';
import { rest } from 'msw';
import { renderWithClient } from './mocks/utils';

function isHeading(element) {
  return /H[1-6]/.test(element.tagName);
}

// Check if heading, subheading, and description are rendered on the page and match the config content.
describe('Home Page', () => {
  it('renders text and links correctly', () => {
    const { getByText } = renderWithClient(<Home />);

    // Check if content matches the config file.
    Object.keys(HOMEPAGE_COPY.sections).forEach(section => {
      Object.keys(HOMEPAGE_COPY.sections[section]).forEach(subSection => {
        const value = HOMEPAGE_COPY.sections[section][subSection];

        // Check if value is a string and if it is rendered on the page.
        if (typeof value === 'string') {
          const textEl = getByText(HOMEPAGE_COPY.sections[section][subSection]);
          expect(textEl).toBeInTheDocument();

          // Check if heading is a heading element.
          if (subSection === 'heading') {
            expect(isHeading(textEl)).toBe(true);
          }
        } else if (subSection === 'routes') {
          // Check that links are being rendered with the correct href and target attributes.
          value.forEach(({ title, path, isExternal }) => {
            const link = screen.getByRole('link', { name: title });
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', path);
            expect(link).toHaveAttribute(
              'target',
              isExternal ? '_blank' : '_self',
            );
          });
        }
      });
    });

    // Check that the sample queries are rendered as links on the page
    HOME_QUERIES.map(({ title, searchTerms }) => {
      const queryTitle = screen.getByText(title);
      expect(queryTitle).toBeInTheDocument();

      const link = queryTitle.closest('a');
      const encodedHref = encodeURIComponent(searchTerms.join(' OR ')).replace(
        /%20/g,
        '+',
      );
      expect(link).toHaveAttribute('href', `/search?q=${encodedHref}`);
      expect(link).toBeInTheDocument();
    });
  });

  it('successfully renders repositories table rows', async () => {
    const { result } = renderHook(() => useRepoData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const repositories = result.current.data;
    const iid_count = repositories.filter(repo => repo.type === 'iid').length;

    const div = document.createElement('div');
    document.body.append(div);
    renderWithClient(
      <RepositoryTabs
        repositories={repositories}
        setSelectedType={() => jest.fn()}
      >
        <RepositoryTable
          isLoading={false}
          repositories={repositories}
          selectedType='iid'
        />
        ,
      </RepositoryTabs>,
      div,
    );

    // Expect that the tab with the selected type is rendered with the correct number of rows.
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      new RegExp(iid_count, 'i'),
    );
    // Expect that the table renders with the right type of repositories and correct number of rows (+1 for header row).
    expect(screen.getAllByRole('row')).toHaveLength(iid_count + 1);
  });

  it('renders table links', async () => {
    const { result } = renderHook(() => useRepoData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const repositories = result.current.data;

    renderWithClient(
      <RepositoryTable
        isLoading={false}
        repositories={repositories}
        selectedType='generalist'
      />,
    );

    // Get row element that matches the rowIndex.
    const rows = screen.getAllByRole('row');
    const row = rows[rows.length - 1];
    const cell = within(row).getAllByRole('cell')[0];

    // Get link element that contains an href with a query string with the demo repo name.
    const links = within(cell).getAllByRole('link');

    const cellText = cell.textContent;
    const data = repositories.find(repo => repo.label === cellText);

    // Expect that the first link is a logo rendered with the correct href and target attributes.
    expect(links[0]).toHaveAttribute('href', data.url);
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(within(links[0]).getByRole('img')).toBeInTheDocument();
    expect(within(links[0]).getByRole('img')).toHaveAttribute('src', data.icon);

    // Expect that the second link is a text link rendered with the correct href and target attributes.
    expect(links[1]).toHaveAttribute(
      'href',
      expect.stringContaining(data.identifier),
    );
    expect(links[1]).toHaveTextContent(data.label);
  });

  test('failure of repositories query', async () => {
    server.use(
      rest.get('*/metadata', (_, res, ctx) => {
        return res(ctx.status(400));
      }),
    );

    renderWithClient(<Home />);

    // Check that the table is not rendered when there is an error.
    await waitForElementToBeRemoved(() => screen.getAllByTestId('loading'));

    expect(screen.queryByRole(/table/i)).not.toBeInTheDocument();
  });

  test('renders advanced search button', async () => {
    renderWithClient(<Home />);

    const buttonEl = screen.getByRole('button', { name: /advanced search/i });

    expect(buttonEl).toBeInTheDocument();
  });
});
