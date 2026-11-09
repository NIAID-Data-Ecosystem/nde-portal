import { getSafeInternalPath } from '../helpers';

describe('getSafeInternalPath', () => {
  it.each([
    ['/search', '/search'],
    ['/search?q=covid&filters=x#top', '/search?q=covid&filters=x#top'],
    ['/resources/../search', '/search'],
    ['/diseases/HIV-AIDS', '/diseases/HIV-AIDS'],
  ])('accepts root-relative path %p', (value, expected) => {
    expect(getSafeInternalPath(value)).toBe(expected);
  });

  it.each([
    ['javascript:alert(document.domain)//search'],
    ['JaVaScRiPt:alert(1)'],
    ['data:text/html,<script>alert(1)</script>'],
    ['https://example.com/search'],
    ['//example.com/search'],
    ['/\\example.com/search'],
    ['/\t/example.com/search'],
    ['/.//example.com/search'],
    ['/search/..//example.com'],
    ['search'],
    [''],
    [undefined],
    [['/search']],
  ])('rejects %p', value => {
    expect(getSafeInternalPath(value)).toBeUndefined();
  });

  it('restricts the pathname to allowedPathnames when provided', () => {
    expect(getSafeInternalPath('/search?q=x', ['/search'])).toBe('/search?q=x');
    expect(getSafeInternalPath('/search/', ['/search'])).toBeUndefined();
    expect(
      getSafeInternalPath('/resources?q=/search', ['/search']),
    ).toBeUndefined();
  });
});
