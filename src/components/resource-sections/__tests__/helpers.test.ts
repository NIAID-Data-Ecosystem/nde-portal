import { Route, showSection } from '../helpers';
import { FormattedResource } from 'src/utils/api/types';

const makeRoute = (overrides: Partial<Route> = {}): Route =>
  ({
    title: 'Description',
    hash: 'description',
    properties: ['description'],
    ...overrides,
  } as Route);

describe('showSection', () => {
  it('returns false when the section is undefined', () => {
    expect(
      showSection(undefined as unknown as Route, {} as FormattedResource),
    ).toBe(false);
  });

  it('returns false when the section has no properties', () => {
    expect(
      showSection(
        { title: 'Description', hash: 'description' } as Route,
        {
          description: 'value',
        } as FormattedResource,
      ),
    ).toBe(false);
  });

  it('returns true when at least one property has a value', () => {
    expect(
      showSection(makeRoute(), { description: 'value' } as FormattedResource),
    ).toBe(true);
  });

  it('does not show a section when every property is empty and showEmptyState is not set', () => {
    // `showEmptyState` is optional, so the falsy result here is `undefined`
    // rather than `false`; callers only ever use it for truthiness.
    expect(
      showSection(makeRoute(), { description: '' } as FormattedResource),
    ).toBeFalsy();
  });

  it('returns true when every property is empty but showEmptyState is set', () => {
    expect(
      showSection(
        makeRoute({
          ui: {
            showInNavigation: true,
            showEmptyState: true,
            isCollapsible: true,
          },
        }),
        { description: '' } as FormattedResource,
      ),
    ).toBe(true);
  });

  it('returns true for a section hidden from navigation when its data is present', () => {
    // `showInNavigation` only controls whether the section is listed in the
    // sidebar (filtered in src/pages/resources.tsx) — it must not stop the
    // section from rendering on the page.
    expect(
      showSection(
        makeRoute({
          ui: {
            showInNavigation: false,
            showEmptyState: false,
            isCollapsible: true,
          },
        }),
        { description: 'value' } as FormattedResource,
      ),
    ).toBe(true);
  });

  it('resolves dot-separated property paths', () => {
    const route = makeRoute({
      title: 'Example of Work',
      hash: 'exampleOfWork',
      properties: [
        'exampleOfWork.schemaVersion',
      ] as unknown as Route['properties'],
    });

    expect(
      showSection(route, {
        exampleOfWork: { schemaVersion: 'https://example.com/v1' },
      } as FormattedResource),
    ).toBe(true);

    expect(
      showSection(route, {
        exampleOfWork: { encodingFormat: { name: 'JSON' } },
      } as FormattedResource),
    ).toBeFalsy();
  });

  it('returns true when data is undefined', () => {
    // While the resource is still loading there is nothing to check against,
    // so sections stay visible and render their own loading state.
    expect(showSection(makeRoute(), undefined)).toBe(true);
  });
});
