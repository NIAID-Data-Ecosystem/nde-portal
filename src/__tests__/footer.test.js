import * as React from 'react';
import { screen } from '@testing-library/react';
import FOOTER_CONFIG from 'configs/footer.json';
import { renderWithClient } from './mocks/utils';
import { Footer } from 'nde-design-system';
import userEvent from '@testing-library/user-event';

describe('Footer', () => {
  it('renders logos with href tags', () => {
    const { getAllByRole } = renderWithClient(
      <Footer
        navigation={{
          ...FOOTER_CONFIG,
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
    expect(NIAID_anchor).toHaveAttribute('href', FOOTER_CONFIG.niaid);

    const home_anchor = visibleImages[1].closest('a');
    expect(home_anchor).toHaveAttribute('href', FOOTER_CONFIG.href);
  });

  it('renders links according to config', () => {
    const { getAllByText } = renderWithClient(
      <Footer
        navigation={{
          ...FOOTER_CONFIG,
        }}
      />,
    );

    // check that links are rendered on the page with the correct href.
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

    Object.keys(FOOTER_CONFIG).forEach(key => {
      if (Array.isArray(FOOTER_CONFIG[key])) {
        checkLinks(FOOTER_CONFIG[key]);
      } else if (typeof FOOTER_CONFIG[key] === 'object') {
        checkLinks([FOOTER_CONFIG[key]]);
      }
    });
  });
});
