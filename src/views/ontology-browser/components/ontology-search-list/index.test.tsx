import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import React from 'react';
import { act, render, screen, waitFor } from 'src/__tests__/utils/render';
import type { SearchListItem } from 'src/pages/ontology-browser';

import { OntologySearchList } from '.';

/*
The shared `next/link` mock in jest.setup.js renders only `href.pathname` for
object hrefs, which would drop the search query this list builds. It forwards
refs like the real one, since `Button asChild` passes one.
*/
jest.mock('next/link', () => {
  const { forwardRef } = jest.requireActual('react');
  const { format } = jest.requireActual('url');
  return {
    __esModule: true,
    default: forwardRef(
      ({ href, children, prefetch, ...rest }: any, ref: any) => (
        <a
          ref={ref}
          href={typeof href === 'string' ? href : format(href)}
          {...rest}
        >
          {children}
        </a>
      ),
    ),
  };
});

const HUMAN: SearchListItem = {
  ontologyName: 'ncbitaxon',
  taxonId: '9606',
  label: 'Homo sapiens',
  counts: { termCount: 40, termAndChildrenCount: 45 },
};

const MOUSE: SearchListItem = {
  ontologyName: 'ncbitaxon',
  taxonId: '10090',
  label: 'Mus musculus',
  counts: { termCount: 12, termAndChildrenCount: 12 },
};

// Owns the list state, as the ontology browser page does.
const SearchList = ({ initialList }: { initialList: SearchListItem[] }) => {
  const [searchList, setSearchList] = React.useState(initialList);
  return (
    <OntologySearchList searchList={searchList} setSearchList={setSearchList} />
  );
};

// zag drops events sent before its radio machine starts, a microtask after mount.
const setup = async (initialList: SearchListItem[]) => {
  const user = userEvent.setup();
  render(<SearchList initialList={initialList} />);
  await act(async () => {});
  return { user };
};

const searchQuery = () => {
  const href = screen
    .getByRole('link', { name: /search resources/i })
    .getAttribute('href');
  const url = new URL(href || '', 'http://localhost');
  expect(url.pathname).toBe('/search');
  return url.searchParams.get('q');
};

describe('OntologySearchList', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/ontology-browser');
  });

  it('renders nothing when no terms are selected', async () => {
    await setup([]);

    expect(
      screen.queryByText(/list of selected search terms/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /search resources/i }),
    ).not.toBeInTheDocument();
  });

  it('lists each selected term with its ontology and id', async () => {
    await setup([HUMAN, MOUSE]);

    expect(screen.getByText('Homo sapiens')).toBeInTheDocument();
    expect(screen.getByText('ncbitaxon | 9606')).toBeInTheDocument();
    expect(screen.getByText('Mus musculus')).toBeInTheDocument();
    expect(screen.getByText('ncbitaxon | 10090')).toBeInTheDocument();
  });

  it('searches resources for the lineage of a single term', async () => {
    await setup([HUMAN]);

    expect(searchQuery()).toBe('_meta.lineage.taxon:9606');
  });

  it('matches any of several terms by default', async () => {
    await setup([HUMAN, MOUSE]);

    expect(screen.getByRole('radio', { name: 'Match Any' })).toBeChecked();
    expect(searchQuery()).toBe(
      '_meta.lineage.taxon:9606 OR _meta.lineage.taxon:10090',
    );
    // The operator is tagged on every term after the first.
    expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('OR');
  });

  it('matches all terms once "Match All" is picked', async () => {
    const { user } = await setup([HUMAN, MOUSE]);

    await user.click(screen.getByRole('radio', { name: 'Match All' }));

    await waitFor(() =>
      expect(searchQuery()).toBe(
        '_meta.lineage.taxon:9606 AND _meta.lineage.taxon:10090',
      ),
    );
    expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('AND');
  });

  it('disables the match options for a single term', async () => {
    await setup([HUMAN]);

    expect(screen.getByRole('radio', { name: 'Match Any' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Match All' })).toBeDisabled();
  });

  it('enables the match options for several terms', async () => {
    await setup([HUMAN, MOUSE]);

    expect(screen.getByRole('radio', { name: 'Match Any' })).toBeEnabled();
    expect(screen.getByRole('radio', { name: 'Match All' })).toBeEnabled();
  });

  it('narrows the search query the browser was opened with', async () => {
    mockRouter.setCurrentUrl('/ontology-browser?q=covid');
    await setup([HUMAN]);

    expect(searchQuery()).toBe('(covid) AND _meta.lineage.taxon:9606');
  });

  it('removes a term from the list', async () => {
    const { user } = await setup([HUMAN, MOUSE]);

    await user.click(
      screen.getByRole('button', { name: 'remove Homo sapiens from search' }),
    );

    expect(screen.queryByText('Homo sapiens')).not.toBeInTheDocument();
    expect(screen.getByText('Mus musculus')).toBeInTheDocument();
    expect(searchQuery()).toBe('_meta.lineage.taxon:10090');
  });

  it('clears every term', async () => {
    const { user } = await setup([HUMAN, MOUSE]);

    await user.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(screen.queryByText('Homo sapiens')).not.toBeInTheDocument();
    expect(screen.queryByText('Mus musculus')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /search resources/i }),
    ).not.toBeInTheDocument();
  });

  it('collapses the list and expands it again', async () => {
    const { user } = await setup([HUMAN]);
    const expandLabel = 'Expand list of selected search terms';

    // Open by default, so there is nothing to expand.
    expect(
      screen.queryByRole('button', { name: expandLabel }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'Collapse selected search terms list',
      }),
    );
    expect(screen.queryByText('Homo sapiens')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: expandLabel }));
    expect(screen.getByText('Homo sapiens')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: expandLabel }),
    ).not.toBeInTheDocument();
  });
});
