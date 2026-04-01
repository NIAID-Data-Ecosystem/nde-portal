import React from 'react';

const mockDynamic = jest.fn((_loader: any) => () => (
  <div data-testid='dynamic-component' />
));

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (...args: [any]) => mockDynamic(...args),
}));

jest.mock('../nav-layout', () => ({
  Layout: {
    Wrapper: 'wrapper-component',
    Bar: 'bar-component',
    Toggle: 'toggle-component',
  },
}));

describe('navigation components index', () => {
  it('exports layout components and defines dynamic desktop/mobile components', () => {
    jest.isolateModules(() => {
      const { Nav } = require('../index');

      expect(Nav.Wrapper).toBe('wrapper-component');
      expect(Nav.Bar).toBe('bar-component');
      expect(Nav.Toggle).toBe('toggle-component');
      expect(Nav.MobileMenu).toBeDefined();
      expect(Nav.DesktopNavItem).toBeDefined();
      expect(mockDynamic).toHaveBeenCalledTimes(2);
    });
  });
});
