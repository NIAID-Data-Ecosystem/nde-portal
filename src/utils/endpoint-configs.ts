import { EndpointConfig, formatUptimeDuration } from './status-helpers';

/**
 * Central definition of all monitored API endpoints.
 * Shared between the status page and the PagesCard component.
 */
export const ENDPOINTS: EndpointConfig[] = [
  {
    id: 'niaid-data-api',
    name: 'NIAID Data Ecosystem API Health',
    url: `${process.env.NEXT_PUBLIC_API_URL}/metadata`,
    checkHealth: res => {
      if (res?.ok === true && res?.status === 200) return 'operational';
      if (res?.ok === true) return 'operational';
      return 'down';
    },
    extractInfo: data => {
      const info: Record<string, string> = {
        'Server uptime': 'N/A',
      };
      if (typeof data?.uptime === 'number') {
        info['Server uptime'] = formatUptimeDuration(data.uptime);
      }
      info['Environment'] = process.env.NEXT_PUBLIC_APP_ENV || 'N/A';
      return info;
    },
  },
  {
    id: 'niaid-strapi',
    name: 'NIAID Data Ecosystem CMS Health',
    url: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/health`,
    checkHealth: (_res, data) => {
      if (data?.status === 'ok' && data?.env === 'production')
        return 'operational';
      if (data?.status === 'ok') return 'degraded';
      return 'down';
    },
    extractInfo: data => {
      const info: Record<string, string> = {};
      if (typeof data?.uptime === 'number') {
        info['Server uptime'] = formatUptimeDuration(data.uptime);
      }
      info['Environment'] = process.env.NEXT_PUBLIC_APP_ENV || 'N/A';

      // if (data?.env) {
      //   info['Environment'] = data.env;
      // }
      return info;
    },
  },
];

/** Map endpoint IDs to display names. */
export const ENDPOINT_NAMES: Record<string, string> = Object.fromEntries(
  ENDPOINTS.map(ep => [ep.id, ep.name]),
);
