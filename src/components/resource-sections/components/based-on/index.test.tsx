import '@testing-library/jest-dom';

import { ChakraProvider } from '@chakra-ui/react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { system } from 'src/theme';

import { BasedOnActionProcess, BasedOnTable } from '.';

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider value={system}>{ui}</ChakraProvider>);

describe('BasedOnActionProcess', () => {
  it('renders a fallback message when there is no description and no steps', () => {
    renderWithChakra(<BasedOnActionProcess name='Generation' />);

    expect(screen.getByText('No details provided.')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /show details/i }),
    ).not.toBeInTheDocument();
  });

  it('renders a fallback message when actionProcess has an empty step list', () => {
    renderWithChakra(
      <BasedOnActionProcess
        name='Generation'
        actionProcess={{ '@type': 'HowTo', step: [] }}
      />,
    );

    expect(screen.getByText('No details provided.')).toBeInTheDocument();
  });

  it('renders the action name', () => {
    renderWithChakra(
      <BasedOnActionProcess
        name='Curation workflow'
        description='How the collection was built.'
      />,
    );

    expect(screen.getByText('Curation workflow')).toBeInTheDocument();
  });

  it('falls back to "Generation process" when the action has no name', () => {
    renderWithChakra(
      <BasedOnActionProcess description='How the collection was built.' />,
    );

    expect(screen.getByText('Generation process')).toBeInTheDocument();
  });

  it('collapses the how-to steps and description by default', () => {
    renderWithChakra(
      <BasedOnActionProcess
        name='Curation workflow'
        description='How the collection was built.'
        actionProcess={{
          '@type': 'HowTo',
          step: ['Search the source'],
        }}
      />,
    );

    expect(
      screen.getByRole('button', { name: /show details/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('How the collection was built.')).not.toBeVisible();
    expect(screen.getByText('Search the source')).not.toBeVisible();
  });

  it('reveals the description and steps when the toggle is clicked', async () => {
    const user = userEvent.setup();
    renderWithChakra(
      <BasedOnActionProcess
        name='Curation workflow'
        description='How the collection was built.'
        actionProcess={{
          '@type': 'HowTo',
          step: ['Search the source', 'Review the records'],
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /show details/i }));
    expect(screen.getByRole('button', { name: /hide/i })).toBeInTheDocument();

    // AccordionPanel animates open, so it stays `hidden` for a frame or two
    // after the click. Wait for the panel before asserting on its contents.
    await waitFor(() =>
      expect(screen.getByText('How the collection was built.')).toBeVisible(),
    );
    expect(screen.getByText('Search the source')).toBeVisible();
    expect(screen.getByText('Review the records')).toBeVisible();
  });

  it('normalizes a single step string into one step', async () => {
    // `actionProcess.step` may come back from the API as a string or a list.
    const user = userEvent.setup();
    renderWithChakra(
      <BasedOnActionProcess
        name='Curation workflow'
        actionProcess={{ '@type': 'HowTo', step: 'Only step' }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /show details/i }));

    await waitFor(() => expect(screen.getByText('Only step')).toBeVisible());
  });
});

describe('BasedOnTable', () => {
  // The table's page combobox starts its zag machine in a microtask after
  // mount, which updates state; flush it inside `act`.
  const renderTable = async (items: any[]) => {
    const view = renderWithChakra(
      <BasedOnTable loading={false} title='Based on' items={items} />,
    );
    await act(async () => {});
    return view;
  };

  it('renders nothing when there are no items and loading has finished', async () => {
    const { container } = await renderTable([]);

    expect(container.querySelector('table')).not.toBeInTheDocument();
  });

  it('renders a row per item with its name linked to its url', async () => {
    await renderTable([
      {
        '@type': 'Dataset',
        identifier: 'D1',
        name: 'Source dataset',
        url: 'https://example.com/d1',
      },
    ]);

    expect(
      screen.getByRole('link', { name: /Source dataset/ }),
    ).toHaveAttribute('href', 'https://example.com/d1');
    expect(screen.getByText('D1')).toBeInTheDocument();
  });

  it('uses the name as the url when the name is itself a link', async () => {
    await renderTable([
      { '@type': 'SoftwareSourceCode', name: 'https://example.com/repo' },
    ]);

    expect(
      screen.getByRole('link', { name: /https:\/\/example.com\/repo/ }),
    ).toHaveAttribute('href', 'https://example.com/repo');
  });

  it('falls back to codeRepository when the item has no name', async () => {
    await renderTable([
      {
        '@type': 'SoftwareSourceCode',
        codeRepository: 'https://github.com/org/repo',
      },
    ]);

    expect(
      screen.getByRole('link', { name: /https:\/\/github.com\/org\/repo/ }),
    ).toBeInTheDocument();
  });

  /** Body rows' cell text, in order. */
  const getBodyRows = () =>
    within(screen.getByRole('table', { name: 'Based on' }))
      .getAllByRole('row')
      .slice(1)
      .map(row =>
        within(row)
          .getAllByRole('cell')
          .map(cell => cell.textContent),
      );

  it('shows the type, the date as YYYY-MM-DD and the description in their own columns', async () => {
    await renderTable([
      {
        '@type': 'ScholarlyArticle',
        name: 'An article',
        pmid: '123',
        datePublished: '2014-12-03',
        description: 'What the article is about.',
      },
      // No name: the ID stands in, linking to the url.
      {
        '@type': 'ComputationalTool',
        identifier: 'fasta',
        url: 'https://example.com/fasta',
      },
    ]);

    expect(
      within(screen.getByRole('table', { name: 'Based on' }))
        .getAllByRole('columnheader')
        .map(header => header.textContent),
    ).toEqual(['Name', 'Type', 'Date Published', 'Description']);
    expect(getBodyRows()).toEqual([
      [
        'An articlePMID |123',
        'ScholarlyArticle',
        '2014-12-03',
        'What the article is about.',
      ],
      [
        'No name providedID |fasta',
        'ComputationalTool',
        '—No data',
        '—No data',
      ],
    ]);
    expect(screen.getByRole('link', { name: /fasta/ })).toHaveAttribute(
      'href',
      'https://example.com/fasta',
    );
  });

  it('links additional types to their ontology entries', async () => {
    await renderTable([
      {
        '@type': 'Dataset',
        name: 'A dataset',
        additionalType: {
          name: 'Genome',
          url: 'http://purl.obolibrary.org/obo/NCIT_C16629',
        },
      },
    ]);

    expect(screen.getByRole('link', { name: /Genome/ })).toHaveAttribute(
      'href',
      'http://purl.obolibrary.org/obo/NCIT_C16629',
    );
    // The `@type` has no url, so it's text.
    expect(
      screen.queryByRole('link', { name: /^Dataset/ }),
    ).not.toBeInTheDocument();
  });

  it('shows "No data" in the name cell only when there is nothing to show', async () => {
    await renderTable([{ '@type': 'Dataset' }]);
    expect(getBodyRows()[0][0]).toBe('—No data');
  });
});
