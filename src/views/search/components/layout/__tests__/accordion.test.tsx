import userEvent from '@testing-library/user-event';
import React, { useEffect } from 'react';
import { act, render, screen, waitFor } from 'src/__tests__/utils/render';

import { AccordionContent, AccordionWrapper } from '../accordion';

/*
AccordionWrapper's `defaultValue` re-opens the sections when it changes (a new
search's counts), without remounting them: a remount reset every section's
results to their first render, which flashed blank on each filter change.
*/

const onMount = jest.fn();
const Section = ({ name }: { name: string }) => {
  useEffect(() => onMount(name), [name]);
  return <p>{name} results</p>;
};

const Sections = ({
  defaultValue,
  holdDefaultValue,
}: {
  defaultValue: string[];
  holdDefaultValue?: boolean;
}) => (
  <AccordionWrapper
    defaultValue={defaultValue}
    holdDefaultValue={holdDefaultValue}
  >
    <AccordionContent value='a' title='Section A'>
      <Section name='A' />
    </AccordionContent>
    <AccordionContent value='b' title='Section B'>
      <Section name='B' />
    </AccordionContent>
  </AccordionWrapper>
);

const trigger = (title: string) =>
  screen.getByRole('button', { name: new RegExp(title) });
const expectOpen = (title: string, open: boolean) =>
  waitFor(() =>
    expect(trigger(title)).toHaveAttribute('aria-expanded', String(open)),
  );

const setup = async (props: React.ComponentProps<typeof Sections>) => {
  const view = render(<Sections {...props} />);
  // zag starts its machines in a microtask; let them start.
  await act(async () => {});
  return view;
};

describe('AccordionWrapper', () => {
  beforeEach(() => onMount.mockClear());

  it('opens the default sections', async () => {
    await setup({ defaultValue: ['a'] });

    await expectOpen('Section A', true);
    await expectOpen('Section B', false);
  });

  it('re-opens the sections for a new default without remounting them', async () => {
    const { rerender } = await setup({ defaultValue: ['a'] });
    expect(await screen.findByText('A results')).toBeVisible();
    const sectionA = screen.getByText('A results');

    rerender(<Sections defaultValue={['a', 'b']} />);

    await expectOpen('Section B', true);
    expect(await screen.findByText('B results')).toBeVisible();
    expect(screen.getByText('A results')).toBe(sectionA);
    expect(onMount.mock.calls).toEqual([['A'], ['B']]);
  });

  it('waits to apply a new default while it is held', async () => {
    const { rerender } = await setup({ defaultValue: ['a', 'b'] });
    await expectOpen('Section B', true);

    // Counts loading: the default reads as fewer sections for now.
    rerender(<Sections defaultValue={['a']} holdDefaultValue />);
    await act(async () => {});
    await expectOpen('Section B', true);

    // They're in and it's the same as before, so nothing changes.
    rerender(<Sections defaultValue={['a', 'b']} />);
    await act(async () => {});
    await expectOpen('Section B', true);
  });

  it("keeps the user's toggles until the default changes", async () => {
    const user = userEvent.setup();
    const { rerender } = await setup({ defaultValue: ['a'] });

    await user.click(trigger('Section A'));
    await expectOpen('Section A', false);

    // A new array with the same sections is not a new default.
    rerender(<Sections defaultValue={['a']} />);
    await act(async () => {});
    await expectOpen('Section A', false);

    rerender(<Sections defaultValue={['a', 'b']} />);
    await expectOpen('Section A', true);
    await expectOpen('Section B', true);
  });
});
