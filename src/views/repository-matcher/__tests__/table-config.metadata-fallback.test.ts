// Loads table-config with the metadata helpers stubbed to empty strings so the
// module-level `getMetadataName(...) || ''` / `getMetadataDescription(...) || ''`
// fallback branches execute (the real helpers never return empty).
jest.mock('src/components/metadata', () => ({
  getMetadataName: () => '',
  getMetadataDescription: () => '',
}));

import { REPOSITORY_MATCHER_COLUMNS } from '../table-config';

describe('table-config with empty metadata', () => {
  it('falls back to empty labels and descriptions', () => {
    const name = REPOSITORY_MATCHER_COLUMNS.find(c => c.id === 'name');
    // label = getMetadataName('name') || '' -> ''
    expect(name?.label).toBe('');

    const healthCondition = REPOSITORY_MATCHER_COLUMNS.find(
      c => c.id === 'healthCondition',
    );
    expect(healthCondition?.info?.description).toBe('');
  });
});
