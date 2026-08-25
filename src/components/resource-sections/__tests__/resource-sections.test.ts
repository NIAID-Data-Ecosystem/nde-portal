import { RESOURCE_SECTIONS } from '../resource-sections';

const routes = RESOURCE_SECTIONS.routes;
const getRoute = (hash: string) => routes.find(route => route.hash === hash);

describe('RESOURCE_SECTIONS', () => {
  it('gives every route a title, hash, properties and ui config', () => {
    routes.forEach(route => {
      expect(route.title).toBeTruthy();
      expect(route.hash).toBeTruthy();
      expect(Array.isArray(route.properties)).toBe(true);
      expect(route.properties.length).toBeGreaterThan(0);
      expect(route.ui).toBeDefined();
    });
  });

  it('uses a unique hash per route', () => {
    const hashes = routes.map(route => route.hash);

    expect(new Set(hashes).size).toBe(hashes.length);
  });

  it('drives the overview section off the fields the About block renders', () => {
    // AboutResource reads about, collectionSize, exampleOfWork.about and genre,
    // so the overview section must stay visible when only those are present.
    const overview = getRoute('overview');

    expect(overview?.properties).toEqual(
      expect.arrayContaining([
        'about',
        'collectionSize',
        'exampleOfWork.about',
        'genre',
      ]),
    );
  });

  it('defines an exampleOfWork section keyed off the fields it renders', () => {
    // `exampleOfWork.about` is intentionally excluded — it is shown in the
    // overview's Content Types block, not in this section.
    const exampleOfWork = getRoute('exampleOfWork');

    expect(exampleOfWork).toBeDefined();
    expect(exampleOfWork?.title).toBe('Example of Work');
    expect(exampleOfWork?.properties).toEqual([
      'exampleOfWork.encodingFormat',
      'exampleOfWork.schemaVersion',
      'exampleOfWork.additionalProperty',
    ]);
  });

  it('keeps a description section for non-DataCollection resources', () => {
    expect(getRoute('description')?.properties).toEqual(['description']);
  });
});
