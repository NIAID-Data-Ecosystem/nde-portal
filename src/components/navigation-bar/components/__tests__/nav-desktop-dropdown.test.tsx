import { Popover } from '@chakra-ui/react';
import React from 'react';
import { act, fireEvent, render, screen } from 'src/__tests__/utils/render';

import {
  NavDropdown,
  NavDropdownMenu,
  NavDropdownTrigger,
} from '../nav-desktop-dropdown';

const mockNavDropdownItem = jest.fn(({ label }: { label: string }) => (
  <div>{`item:${label}`}</div>
));

jest.mock('../nav-dropdown-item', () => ({
  NavDropdownItem: (props: unknown) => mockNavDropdownItem(props as any),
}));

// NavDropdown renders Popover parts, which throw outside of a Popover.Root.
const OpenPopover = ({ children }: { children: React.ReactNode }) => (
  <Popover.Root open>{children}</Popover.Root>
);

// An open popover positions itself asynchronously after mount, which updates
// its state; flush that inside `act`.
const flushPositioning = () => act(async () => {});

describe('nav desktop dropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens trigger popover content on click', async () => {
    render(
      <NavDropdownTrigger label='Resources'>
        <div>dropdown-content</div>
      </NavDropdownTrigger>,
    );

    const trigger = screen.getByRole('button', { name: /resources/i });
    expect(screen.queryByText('dropdown-content')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(await screen.findByText('dropdown-content')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders explicit NavDropdown container', async () => {
    render(
      <OpenPopover>
        <NavDropdown>
          <div>inner</div>
        </NavDropdown>
      </OpenPopover>,
    );
    await flushPositioning();

    expect(screen.getByText('inner')).toBeInTheDocument();
  });

  it('returns null when routes are empty and renders items otherwise', async () => {
    /*
    No Popover.Root here: an empty menu must return before rendering any
    Popover part (which would throw without one), and an open popover with no
    content makes zag's dismissable warn that it has no node to watch.
    */
    const { container, rerender } = render(<NavDropdownMenu routes={[]} />);
    expect(container).toBeEmptyDOMElement();

    const routes = [
      { label: 'A', href: '/a' },
      { label: 'B', href: '/b' },
    ] as any;
    rerender(
      <OpenPopover>
        <NavDropdownMenu routes={routes} />
      </OpenPopover>,
    );
    await flushPositioning();

    expect(screen.getByText('item:A')).toBeInTheDocument();
    expect(screen.getByText('item:B')).toBeInTheDocument();
    expect(mockNavDropdownItem).toHaveBeenCalledTimes(2);
  });

  it('supports route entries without href (label fallback key path)', async () => {
    render(
      <OpenPopover>
        <NavDropdownMenu routes={[{ label: 'NoHref' }] as any} />
      </OpenPopover>,
    );
    await flushPositioning();
    expect(screen.getByText('item:NoHref')).toBeInTheDocument();
  });
});
