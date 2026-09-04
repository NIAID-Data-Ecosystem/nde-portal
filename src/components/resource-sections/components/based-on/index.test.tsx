import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { BasedOnActionProcess, BasedOnTable } from '.';

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

describe('BasedOnActionProcess', () => {
  it('renders a fallback message when there is no description and no steps', () => {
    renderWithChakra(<BasedOnActionProcess name='Generation' />);

    expect(screen.getByText('No details provided.')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Show/ }),
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

    expect(screen.getByRole('button', { name: /Show/ })).toBeInTheDocument();
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

    await user.click(screen.getByRole('button', { name: /Show/ }));

    expect(screen.getByRole('button', { name: /Hide/ })).toBeInTheDocument();
    expect(screen.getByText('How the collection was built.')).toBeVisible();
    await waitFor(() =>
      expect(screen.getByText('Search the source')).toBeVisible(),
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

    await user.click(screen.getByRole('button', { name: /Show/ }));

    expect(screen.getByText('Only step')).toBeVisible();
  });
});

describe('BasedOnTable', () => {
  const renderTable = (items: any[]) =>
    renderWithChakra(
      <BasedOnTable
        id='is-based-on'
        isLoading={false}
        caption='Table showing resources that this resource is based on.'
        title='Based on'
        items={items}
      />,
    );

  it('renders nothing when there are no items and loading has finished', () => {
    const { container } = renderTable([]);

    expect(container.querySelector('table')).not.toBeInTheDocument();
  });

  it('renders a row per item with its name linked to its url', () => {
    renderTable([
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

  it('uses the name as the url when the name is itself a link', () => {
    renderTable([
      { '@type': 'SoftwareSourceCode', name: 'https://example.com/repo' },
    ]);

    expect(
      screen.getByRole('link', { name: /https:\/\/example.com\/repo/ }),
    ).toHaveAttribute('href', 'https://example.com/repo');
  });

  it('falls back to codeRepository when the item has no name', () => {
    renderTable([
      {
        '@type': 'SoftwareSourceCode',
        codeRepository: 'https://github.com/org/repo',
      },
    ]);

    expect(
      screen.getByRole('link', { name: /https:\/\/github.com\/org\/repo/ }),
    ).toBeInTheDocument();
  });
});
