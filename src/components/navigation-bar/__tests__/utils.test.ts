import { buildNavigationFromConfig, filterRoutesByEnv } from '../utils';
import { SiteConfig } from '../page-container/types';

describe('navigation utils', () => {
  it('returns unfiltered routes when environment is empty', () => {
    const routes = [
      { label: 'Public', href: '/public' },
      { label: 'Dev', href: '/dev', env: ['dev'] },
    ];

    expect(filterRoutesByEnv(routes as any, '')).toEqual(routes);
  });

  it('filters recursively by environment constraints', () => {
    const routes = [
      {
        label: 'Parent',
        routes: [
          { label: 'Child Dev', href: '/dev', env: ['development'] },
          { label: 'Child Prod', href: '/prod', env: ['production'] },
          { label: 'Child Any', href: '/any' },
        ],
      },
      { label: 'Top Prod', href: '/top-prod', env: ['production'] },
      { label: 'Top Any', href: '/top-any' },
    ];

    expect(filterRoutesByEnv(routes as any, 'development')).toEqual([
      {
        label: 'Parent',
        routes: [
          { label: 'Child Dev', href: '/dev', env: ['development'] },
          { label: 'Child Any', href: '/any' },
        ],
      },
      { label: 'Top Any', href: '/top-any' },
    ]);
  });

  it('builds navigation from page and route config entries', () => {
    const config: SiteConfig = {
      site: {
        name: 'NDE',
        previewImage: 'preview.png',
        seo: { title: 'NDE', description: 'test' },
      },
      pages: {
        '/home': {
          seo: { title: 'Home', description: 'home' },
          nav: { label: 'Home Page', href: '/home-custom' },
        },
        '/about': {
          seo: { title: 'About', description: 'about' },
          nav: { label: 'About', description: 'About section' },
          env: ['development'],
        },
      },
      navigation: {
        primary: [
          { label: 'Home', page: '/home' },
          { label: 'Docs', routes: [{ page: '/about' }, { page: '/missing' }] },
          { label: 'Ignored' },
        ],
      },
      footer: {
        links: [],
      },
    } as any;

    expect(buildNavigationFromConfig(config)).toEqual([
      {
        label: 'Home',
        href: '/home',
      },
      {
        label: 'Docs',
        routes: [
          {
            label: 'About',
            description: 'About section',
            href: '/about',
            env: ['development'],
          },
          {
            href: '/missing',
            env: undefined,
          },
        ],
      },
    ]);
  });
});
