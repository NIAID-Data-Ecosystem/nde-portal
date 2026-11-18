import React from 'react';
import { fireEvent, render, screen } from 'src/__tests__/utils/render';

import { Alert } from '.';

describe('Alert', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('hides children behind a persisted Read More toggle by default', () => {
    render(
      <Alert id='test-alert' title='Title'>
        Details
      </Alert>,
    );

    expect(screen.getByText('Details')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Read Less' }));

    expect(screen.queryByText('Details')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read More' })).toBeVisible();
    expect(window.localStorage.getItem('test-alert')).toBe('false');
  });

  it('always shows children without a toggle when not collapsible', () => {
    window.localStorage.setItem('undefined', 'false');
    render(
      <Alert title='Title' collapsible={false}>
        Details
      </Alert>,
    );

    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
