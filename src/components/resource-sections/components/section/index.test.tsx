import '@testing-library/jest-dom';

import React from 'react';
import { act, render, screen } from 'src/__tests__/utils/render';

import { Section } from '.';

const renderSection = async (name?: string) => {
  render(
    <Section id='overview' name={name}>
      <p>Section content</p>
    </Section>,
  );
  // zag starts the accordion machine in a microtask after mount.
  await act(async () => {});
};

describe('Section', () => {
  it('titles the section with an h2 wrapping the accordion trigger', async () => {
    await renderSection('Overview');

    const heading = screen.getByRole('heading', {
      level: 2,
      name: /overview/i,
    });
    expect(heading).toContainElement(
      screen.getByRole('button', { name: /overview/i }),
    );
  });

  it('renders no heading when the section has no name', async () => {
    await renderSection();

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
