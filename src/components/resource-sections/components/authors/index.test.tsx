import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import React from 'react';
import { act, render, screen } from 'src/__tests__/utils/render';
import { Author } from 'src/utils/api/types';

import ResourceAuthors from '.';

const renderAuthors = async (authors: Author[]) => {
  render(<ResourceAuthors authors={authors} />);
  // zag starts the accordion machine in a microtask after mount, and drops
  // any click that lands before it.
  await act(async () => {});
};

describe('ResourceAuthors', () => {
  it('renders nothing without authors', async () => {
    await renderAuthors([]);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows a short list without details as a plain summary', async () => {
    await renderAuthors([{ name: 'Ada Lovelace' }, { name: 'Alan Turing' }]);

    expect(screen.getByRole('heading')).toHaveTextContent(
      'Ada Lovelace, and Alan Turing.',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('expands into each author’s affiliation and contact links', async () => {
    const user = userEvent.setup();
    await renderAuthors([
      {
        name: 'Ada Lovelace',
        identifier: 'https://orcid.org/0000-0001-2345-6789',
        affiliation: {
          name: 'University of London',
          sameAs: 'https://ror.org/04cw6st05',
        },
      },
      { name: 'Alan Turing', email: 'alan@example.org' },
    ]);
    const trigger = screen.getByRole('button', { name: /show details/i });

    expect(trigger).toHaveTextContent('Ada Lovelace, and Alan Turing.');
    expect(screen.queryByText('University of London')).not.toBeInTheDocument();

    await user.click(trigger);

    expect(
      await screen.findByRole('link', { name: 'University of London' }),
    ).toHaveAttribute('href', 'https://ror.org/04cw6st05');
    expect(screen.getByRole('link', { name: 'ORCID' })).toHaveAttribute(
      'href',
      'https://orcid.org/0000-0001-2345-6789',
    );
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      'mailto:alan@example.org',
    );
    expect(trigger).toHaveTextContent('hide');
  });

  it('expands a truncated summary into the full list', async () => {
    const user = userEvent.setup();
    await renderAuthors(
      Array.from({ length: 12 }, (_, i) => ({ name: `Author ${i + 1}` })),
    );
    const trigger = screen.getByRole('button', { name: /et al/i });

    expect(screen.queryByText(/Author 12/)).not.toBeInTheDocument();

    await user.click(trigger);

    expect(await screen.findByText('and Author 12')).toBeInTheDocument();
  });
});
