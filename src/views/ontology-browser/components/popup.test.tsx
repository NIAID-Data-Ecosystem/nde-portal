import React from 'react';
import { renderWithClient } from 'src/__tests__/mocks/utils';
import { act, screen, waitFor } from 'src/__tests__/utils/render';
import { SelectedFilterType } from 'src/views/search/components/filters/types';

import { searchOntologyAPI } from '../utils/api-helpers';
import { OntologyBrowserPopup } from './popup';

jest.mock('../utils/api-helpers', () => ({
  ...jest.requireActual('../utils/api-helpers'),
  searchOntologyAPI: jest.fn(),
}));

/*
The shared `next/link` mock in jest.setup.js renders only `href.pathname` for
object hrefs, which would drop the query the browser is opened with. It forwards
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

const mockedSearchOntologyAPI = searchOntologyAPI as jest.Mock;

const HUMAN_SUGGESTION = {
  _id: '9606',
  definingAPI: 'biothings',
  definingOntology: 'ncbitaxon',
  label: 'Homo sapiens',
  rank: 'species',
};

const renderPopup = (selectedFilters: SelectedFilterType, querystring = '') =>
  renderWithClient(
    <OntologyBrowserPopup
      querystring={querystring}
      selectedFilters={selectedFilters}
    />,
  );

const popupLink = () =>
  screen.queryByRole('link', { name: /use ontology browser/i });

describe('OntologyBrowserPopup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSearchOntologyAPI.mockResolvedValue([HUMAN_SUGGESTION]);
  });

  it('renders nothing and skips the search without filters or a query', async () => {
    renderPopup({});
    await act(async () => {});

    expect(popupLink()).not.toBeInTheDocument();
    expect(mockedSearchOntologyAPI).not.toHaveBeenCalled();
  });

  it('renders nothing for a query unrelated to the taxonomy', async () => {
    renderPopup({}, 'covid');
    await act(async () => {});

    expect(popupLink()).not.toBeInTheDocument();
    expect(mockedSearchOntologyAPI).not.toHaveBeenCalled();
  });

  it('renders nothing for filters unrelated to the taxonomy', async () => {
    renderPopup({ '@type': ['Dataset'] });
    await act(async () => {});

    expect(popupLink()).not.toBeInTheDocument();
    expect(mockedSearchOntologyAPI).not.toHaveBeenCalled();
  });

  it('searches NCBI Taxonomy for the scientific name of a species filter', async () => {
    // Display names are "<common name> | <scientific name>".
    renderPopup({ 'species.displayName.raw': ['Human | Homo sapiens'] });

    expect(await screen.findByRole('link')).toBeInTheDocument();
    expect(mockedSearchOntologyAPI).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'Homo sapiens', ontology: ['ncbitaxon'] }),
    );
  });

  it('searches for display names that have no common name', async () => {
    renderPopup({ 'infectiousAgent.displayName.raw': ['Escherichia coli'] });

    await waitFor(() =>
      expect(mockedSearchOntologyAPI).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'Escherichia coli' }),
      ),
    );
  });

  it('searches for a taxon name in the querystring', async () => {
    renderPopup({}, 'species.name:"Mus musculus"');

    expect(await screen.findByRole('link')).toBeInTheDocument();
    expect(mockedSearchOntologyAPI).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'Mus musculus', ontology: ['ncbitaxon'] }),
    );
  });

  it('searches for a bare taxon id from the querystring', async () => {
    // BioThings finds no match for a prefixed id such as "ncbitaxon_9606".
    renderPopup({}, 'species.identifier:"9606"');

    expect(await screen.findByRole('link')).toBeInTheDocument();
    expect(mockedSearchOntologyAPI).toHaveBeenCalledWith(
      expect.objectContaining({ q: '9606', ontology: ['ncbitaxon'] }),
    );
  });

  it('searches for a taxon id alongside unrelated filters', async () => {
    renderPopup({ '@type': ['Dataset'] }, 'infectiousAgent.identifier:"562"');

    await waitFor(() =>
      expect(mockedSearchOntologyAPI).toHaveBeenCalledWith(
        expect.objectContaining({ q: '562' }),
      ),
    );
  });

  it('opens the browser on the best match, keeping the search query', async () => {
    renderPopup(
      { 'species.displayName.raw': ['Human | Homo sapiens'] },
      'covid',
    );

    const link = await screen.findByRole('link', {
      name: /use ontology browser/i,
    });
    const url = new URL(link.getAttribute('href') || '', 'http://localhost');
    expect(url.pathname).toBe('/ontology-browser');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      q: 'covid',
      id: '9606',
      ontology: 'ncbitaxon',
    });
  });

  it('renders nothing when the taxonomy has no match', async () => {
    mockedSearchOntologyAPI.mockResolvedValue([]);
    renderPopup({ 'species.displayName.raw': ['Human | Homo sapiens'] });

    await waitFor(() => expect(mockedSearchOntologyAPI).toHaveBeenCalled());
    await act(async () => {});
    expect(popupLink()).not.toBeInTheDocument();
  });

  it('renders nothing when the search fails', async () => {
    mockedSearchOntologyAPI.mockRejectedValue(new Error('Network Error'));
    renderPopup({ 'species.displayName.raw': ['Human | Homo sapiens'] });

    await waitFor(() => expect(mockedSearchOntologyAPI).toHaveBeenCalled());
    await act(async () => {});
    expect(popupLink()).not.toBeInTheDocument();
  });
});
