import * as React from 'react';
import { screen } from '@testing-library/react';
import NAVIGATION_CONFIG from 'configs/nav.json';
import { renderWithClient } from './mocks/utils';
import { Navigation } from 'nde-design-system';
import userEvent from '@testing-library/user-event';

describe('Navigation Bar', () => {
  it('renders logos with href tags', () => {
    const { getAllByRole } = renderWithClient(
      <Navigation
        navigation={{
          ...NAVIGATION_CONFIG,
        }}
      />,
    );

    const images = getAllByRole('img');

    // Filter images with opacity 1
    const visibleImages = images.filter(img => {
      const style = window.getComputedStyle(img);
      return style.display !== 'none';
    });

    const NIAID_anchor = visibleImages[0].closest('a');
    expect(NIAID_anchor).toHaveAttribute('href', NAVIGATION_CONFIG.niaid);

    const home_anchor = visibleImages[1].closest('a');
    expect(home_anchor).toHaveAttribute('href', NAVIGATION_CONFIG.href);
  });

  it('renders links according to config', () => {
    const { getAllByText } = renderWithClient(
      <Navigation
        navigation={{
          ...NAVIGATION_CONFIG,
        }}
      />,
    );

    const checkLinks = config =>
      config.forEach(({ label, href, routes }) => {
        if (!href) {
          if (routes && routes.length > 0) {
            checkLinks(routes);
          }
          return;
        }

        const links = getAllByText(label);
        links.forEach(link => {
          expect(link).toBeInTheDocument();

          const anchor = link.closest('a');
          expect(anchor).toHaveAttribute('href', href);
        });
      });

    checkLinks(NAVIGATION_CONFIG.routes);
  });

  it('toggles open/closed mobile menu', async () => {
    const { container, getByLabelText } = renderWithClient(
      <Navigation
        navigation={{
          ...NAVIGATION_CONFIG,
        }}
      />,
    );
    const element = container.querySelector('.chakra-collapse');
    const menuList = window.getComputedStyle(element);
    expect(menuList.display).toBe('none');

    const menuButton = getByLabelText('Toggle Navigation');
    await userEvent.click(menuButton);

    const menuListExpanded = window.getComputedStyle(element);
    expect(menuListExpanded.display).toBe('block');
  });
  it('toggles open/closed sub menu', async () => {
    const { container } = renderWithClient(
      <Navigation
        navigation={{
          ...NAVIGATION_CONFIG,
        }}
      />,
    );
    const popover_menu_button = screen
      .getAllByText(/resources/i)
      .filter(link => {
        // Filtering for elements which have the class "chakra-button" and text "resources"
        return link.className.includes('chakra-button');
      })[0];

    const popover_menu = container.querySelector('.chakra-popover__popper');
    expect(window.getComputedStyle(popover_menu).visibility).toBe('hidden');

    await userEvent.click(popover_menu_button);

    expect(window.getComputedStyle(popover_menu).visibility).toBe('visible');
  });
});
