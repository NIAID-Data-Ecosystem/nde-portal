import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import React from 'react';
import { act, render, screen, waitFor } from 'src/__tests__/utils/render';

import { DetailsAccordion, DetailsAccordionProps } from '.';

const renderAccordion = async (props: Partial<DetailsAccordionProps> = {}) => {
  render(
    <DetailsAccordion summary={<span>Ten authors</span>} {...props}>
      <p>Author affiliations</p>
    </DetailsAccordion>,
  );
  // zag starts the accordion machine in a microtask after mount, and drops
  // any click that lands before it.
  await act(async () => {});
  return screen.getByRole('button', { name: /ten authors/i });
};

describe('DetailsAccordion', () => {
  it('starts collapsed, with the details not mounted', async () => {
    const trigger = await renderAccordion();

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveTextContent('show details');
    expect(screen.queryByText('Author affiliations')).not.toBeInTheDocument();
  });

  it('reveals the details in a region labelled by the trigger', async () => {
    const user = userEvent.setup();
    const trigger = await renderAccordion();

    await user.click(trigger);

    const region = await screen.findByRole('region', { name: /ten authors/i });
    expect(region).toContainElement(screen.getByText('Author affiliations'));
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveTextContent('hide');
  });

  it('unmounts the details again on collapse', async () => {
    const user = userEvent.setup();
    const trigger = await renderAccordion();

    await user.click(trigger);
    await screen.findByText('Author affiliations');
    await user.click(trigger);

    await waitFor(() =>
      expect(screen.queryByText('Author affiliations')).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveTextContent('show details');
  });

  it('uses the given control labels', async () => {
    const user = userEvent.setup();
    const trigger = await renderAccordion({
      showLabel: 'show metadata',
      hideLabel: 'hide metadata',
    });

    expect(trigger).toHaveTextContent('show metadata');
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveTextContent('hide metadata'));
  });

  // The accordion slot recipe underlines the label on trigger hover by targeting this attribute.
  it('marks the control label for the hover underline', async () => {
    await renderAccordion();

    expect(screen.getByText('show details')).toHaveAttribute(
      'data-accordion-control',
    );
  });

  it('renders no heading by default', async () => {
    await renderAccordion();

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('wraps the trigger in a heading of the given level', async () => {
    const trigger = await renderAccordion({ headingLevel: 'h3' });

    expect(screen.getByRole('heading', { level: 3 })).toContainElement(trigger);
  });
});
