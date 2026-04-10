import React from 'react';
import { checkA11y } from 'src/__tests__/a11y-utils';
import { StatusBanner } from './StatusBanner';
import { StatusBadge } from './StatusBadge';
import { EndpointCard } from './EndpointCard';
import { PagesCard } from './PagesCard';
import { UptimeBar } from './UptimeBar';
import {
  DayStatus,
  EndpointStatus,
  initializeHistory,
} from 'src/utils/status-helpers';

jest.mock('src/hooks/usePageAvailability', () => ({
  usePageAvailability: () => ({}),
}));

jest.mock('src/hooks/useEndpointHealth', () => ({
  useEndpointHealth: (config: { id: string; name: string }) => ({
    id: config.id,
    name: config.name,
    status: 'operational' as EndpointStatus,
    responseTime: 120,
    lastChecked: new Date(),
    history: initializeHistory(),
  }),
}));

jest.mock('src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    checkAuth: jest.fn(),
    loginProviders: [],
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const mockHistory: DayStatus[] = Array.from({ length: 90 }, (_, i) => ({
  date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
  status: 'operational' as const,
  incidents: 0,
}));

const mockMixedHistory: DayStatus[] = mockHistory.map((day, i) => ({
  ...day,
  status:
    i === 0
      ? 'degraded'
      : i === 1
      ? 'down'
      : ('operational' as EndpointStatus | 'no-data'),
  incidents: i < 2 ? 1 : 0,
}));

describe('StatusBanner accessibility', () => {
  it('has no WCAG AA violations when operational', async () => {
    await checkA11y(<StatusBanner status='operational' />);
  });

  it('has no WCAG AA violations during partial outage', async () => {
    await checkA11y(<StatusBanner status='partial' />);
  });

  it('has no WCAG AA violations during major outage', async () => {
    await checkA11y(<StatusBanner status='major' />);
  });
});

describe('StatusBadge accessibility', () => {
  it.each<EndpointStatus | 'loading'>([
    'operational',
    'degraded',
    'down',
    'loading',
  ])('has no WCAG AA violations for status "%s"', async status => {
    await checkA11y(<StatusBadge status={status} />);
  });
});

describe('EndpointCard accessibility', () => {
  const baseProps = {
    id: 'test-endpoint',
    name: 'Test API Endpoint',
    responseTime: 145 as number | null,
    lastChecked: new Date(),
    history: mockHistory,
  };

  it('has no WCAG AA violations when operational', async () => {
    await checkA11y(<EndpointCard {...baseProps} status='operational' />);
  });

  it('has no WCAG AA violations when degraded with mixed history', async () => {
    await checkA11y(
      <EndpointCard
        {...baseProps}
        status='degraded'
        history={mockMixedHistory}
      />,
    );
  });

  it('has no WCAG AA violations when down with error', async () => {
    await checkA11y(
      <EndpointCard
        {...baseProps}
        status='down'
        error='Connection refused'
        responseTime={null}
      />,
    );
  });

  it('has no WCAG AA violations with extra info', async () => {
    await checkA11y(
      <EndpointCard
        {...baseProps}
        status='operational'
        extraInfo={{ 'Server uptime': '45d 3h', Environment: 'production' }}
      />,
    );
  });

  it('has no WCAG AA violations in loading state', async () => {
    await checkA11y(
      <EndpointCard
        {...baseProps}
        status='loading'
        responseTime={null}
        lastChecked={null}
      />,
    );
  });
});

describe('UptimeBar accessibility', () => {
  it('has no WCAG AA violations with full operational history', async () => {
    await checkA11y(<UptimeBar history={mockHistory} />);
  });

  it('has no WCAG AA violations with mixed status history', async () => {
    await checkA11y(<UptimeBar history={mockMixedHistory} />);
  });
});

describe('PagesCard accessibility', () => {
  it('has no WCAG AA violations when all endpoints operational', async () => {
    await checkA11y(
      <PagesCard
        endpointStatuses={{
          'niaid-data-api': 'operational',
          'niaid-strapi': 'operational',
        }}
      />,
    );
  });

  it('has no WCAG AA violations when an endpoint is degraded', async () => {
    await checkA11y(
      <PagesCard
        endpointStatuses={{
          'niaid-data-api': 'degraded',
          'niaid-strapi': 'operational',
        }}
      />,
    );
  });

  it('has no WCAG AA violations when an endpoint is down', async () => {
    await checkA11y(
      <PagesCard
        endpointStatuses={{ 'niaid-data-api': 'down', 'niaid-strapi': 'down' }}
      />,
    );
  });

  it('has no WCAG AA violations in loading state', async () => {
    await checkA11y(
      <PagesCard
        endpointStatuses={{
          'niaid-data-api': 'loading',
          'niaid-strapi': 'loading',
        }}
      />,
    );
  });
});

describe('Status page integration accessibility', () => {
  // Uses the useEndpointHealth mock defined at the top of this file.
  // Import the page-level component directly to test the full composed tree.
  it('has no WCAG AA violations with all endpoints operational', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { default: StatusPage } = require('src/pages/status');
    await checkA11y(<StatusPage />);
  });
});
