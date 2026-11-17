import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import React from 'react';
import { act, render, screen, within } from 'src/__tests__/utils/render';
import { FormattedResource } from 'src/utils/api/types';

import MetadataAccordion from '.';

const data = {
  id: 'dde_123',
  '@type': 'Dataset',
  measurementTechnique: [{ name: 'sequencing assay' }],
} as FormattedResource;

const renderAccordion = async () => {
  render(<MetadataAccordion data={data} />);
  // zag starts the accordion machine in a microtask after mount, and drops
  // any click that lands before it.
  await act(async () => {});
  return screen.getByRole('button', { name: /show metadata/i });
};

describe('MetadataAccordion', () => {
  it('summarises the metadata as pills in a collapsed, headed trigger', async () => {
    const trigger = await renderAccordion();

    expect(screen.getByRole('heading', { level: 2 })).toContainElement(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(within(trigger).getByText('Measurement Technique')).toBeVisible();
    expect(screen.queryByText('sequencing assay')).not.toBeInTheDocument();
  });

  it('mounts the metadata blocks on expand', async () => {
    const user = userEvent.setup();
    const trigger = await renderAccordion();

    await user.click(trigger);

    const region = await screen.findByRole('region', {
      name: /measurement technique/i,
    });
    expect(await within(region).findByText('sequencing assay')).toBeVisible();
    expect(trigger).toHaveTextContent('hide metadata');
  });
});
