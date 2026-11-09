import { act, renderHook } from '@testing-library/react';

import {
  useColumnPreferences,
  UseColumnPreferencesOptions,
} from '../hooks/useColumnPreferences';

const COLUMNS = [
  { id: 'name', hideable: false },
  { id: 'description' },
  { id: 'domain' },
  { id: 'license', defaultVisible: false },
];
const KEY = 'nde:table:test:v1';

const setup = (options: Partial<UseColumnPreferencesOptions> = {}) =>
  renderHook(() =>
    useColumnPreferences({ tableId: 'test', columns: COLUMNS, ...options }),
  );

const stored = () => JSON.parse(window.localStorage.getItem(KEY) ?? 'null');

beforeEach(() => window.localStorage.clear());

describe('useColumnPreferences', () => {
  it('starts from the defaults: default-visible columns, declared order, unpinned', () => {
    const { result } = setup();
    expect(result.current.visibleIds).toEqual([
      'name',
      'description',
      'domain',
    ]);
    expect(result.current.order).toEqual([
      'name',
      'description',
      'domain',
      'license',
    ]);
    expect(result.current.pinned).toBe(false);
    expect(result.current.requiredIds).toEqual(['name']);
  });

  it('hides and shows columns and persists them under a versioned key', () => {
    const { result } = setup();
    act(() => result.current.setVisible('description', false));
    expect(result.current.visibleIds).toEqual(['name', 'domain']);
    act(() => result.current.setVisible('license', true));
    expect(result.current.visibleIds).toEqual(['name', 'domain', 'license']);
    expect(stored()).toEqual({
      v: 1,
      visible: ['name', 'domain', 'license'],
      order: ['name', 'description', 'domain', 'license'],
      pinned: false,
    });
  });

  it('never hides a non-hideable column', () => {
    const { result } = setup();
    act(() => result.current.setVisible('name', false));
    expect(result.current.visibleIds).toContain('name');
  });

  it('reorders with move up/down and drag, keeping required columns first', () => {
    const { result } = setup();
    act(() => result.current.moveDown('description'));
    expect(result.current.order).toEqual([
      'name',
      'domain',
      'description',
      'license',
    ]);
    act(() => result.current.moveUp('description'));
    expect(result.current.order).toEqual([
      'name',
      'description',
      'domain',
      'license',
    ]);
    // Can't move above the required column, or below the last one.
    act(() => result.current.moveUp('description'));
    act(() => result.current.moveDown('license'));
    expect(result.current.order).toEqual([
      'name',
      'description',
      'domain',
      'license',
    ]);
    act(() => result.current.move('license', 'name'));
    expect(result.current.order).toEqual([
      'name',
      'license',
      'description',
      'domain',
    ]);
    // visibleIds follow the order.
    act(() => result.current.setVisible('license', true));
    expect(result.current.visibleIds).toEqual([
      'name',
      'license',
      'description',
      'domain',
    ]);
  });

  it('toggles all columns, clearing back to the fallback columns', () => {
    const { result } = setup({ fallbackIds: ['description'] });
    act(() => result.current.toggleAll());
    expect(result.current.visibleIds).toEqual([
      'name',
      'description',
      'domain',
      'license',
    ]);
    act(() => result.current.toggleAll());
    expect(result.current.visibleIds).toEqual(['name', 'description']);
  });

  it('persists the pinned state and resets everything to defaults', () => {
    const { result } = setup();
    act(() => {
      result.current.setPinned(true);
      result.current.setVisible('description', false);
      result.current.moveDown('domain');
    });
    expect(result.current.pinned).toBe(true);
    expect(result.current.visibleIds).toEqual(['name', 'domain']);
    act(() => result.current.reset());
    expect(result.current.pinned).toBe(false);
    expect(result.current.visibleIds).toEqual([
      'name',
      'description',
      'domain',
    ]);
    expect(result.current.order).toEqual([
      'name',
      'description',
      'domain',
      'license',
    ]);
  });

  it('shares state between hooks with the same table id', () => {
    const a = setup();
    const b = setup();
    act(() => a.result.current.setVisible('domain', false));
    expect(b.result.current.visibleIds).toEqual(['name', 'description']);
  });

  it('shows columns added after the user saved according to their defaults, in place', () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        v: 1,
        visible: ['name', 'domain'],
        order: ['name', 'domain'],
      }),
    );
    const { result } = setup();
    // `description` is new and visible by default; `license` is new and hidden by default.
    expect(result.current.order).toEqual([
      'name',
      'description',
      'domain',
      'license',
    ]);
    expect(result.current.visibleIds).toEqual([
      'name',
      'description',
      'domain',
    ]);
  });

  it('ignores unknown ids and falls back to defaults for an empty or corrupt value', () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ visible: ['bogus'], order: ['bogus'] }),
    );
    expect(setup().result.current.visibleIds).toEqual([
      'name',
      'description',
      'domain',
    ]);
    window.localStorage.setItem(KEY, '{not json');
    expect(setup().result.current.visibleIds).toEqual([
      'name',
      'description',
      'domain',
    ]);
  });

  describe('when localStorage refuses writes', () => {
    const originalSetItem = Storage.prototype.setItem;
    let setItem: jest.SpyInstance;
    beforeEach(() => {
      // Only preference keys fail, so tests can still seed legacy keys.
      setItem = jest
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(function (this: Storage, key, value) {
          if (key.startsWith('nde:table:')) {
            throw new DOMException('Quota exceeded', 'QuotaExceededError');
          }
          originalSetItem.call(this, key, value);
        });
    });
    afterEach(() => jest.restoreAllMocks());

    // Unsaved values last for the session, so each test uses its own table.
    const keyFor = (tableId: string) => `nde:table:${tableId}:v1`;

    it('keeps customizing in memory, shared between hooks', () => {
      const tableId = 'unsaved-shared';
      const a = setup({ tableId });
      const b = setup({ tableId });
      act(() => a.result.current.setVisible('description', false));
      act(() => a.result.current.setVisible('license', true));
      act(() => a.result.current.moveDown('domain'));
      act(() => a.result.current.setPinned(true));
      expect(a.result.current.visibleIds).toEqual([
        'name',
        'license',
        'domain',
      ]);
      expect(a.result.current.pinned).toBe(true);
      expect(b.result.current.visibleIds).toEqual(a.result.current.visibleIds);
      expect(window.localStorage.getItem(keyFor(tableId))).toBeNull();
    });

    it('keeps the legacy keys, since nothing replaced them', () => {
      window.localStorage.setItem('old-visible', JSON.stringify(['domain']));
      const { result } = setup({
        tableId: 'unsaved-legacy',
        legacyKeys: { visible: 'old-visible' },
      });
      act(() => result.current.setVisible('license', true));
      expect(result.current.visibleIds).toEqual(['name', 'domain', 'license']);
      expect(window.localStorage.getItem('old-visible')).toBe('["domain"]');
    });

    it('persists the in-memory state once writes succeed again', () => {
      const tableId = 'unsaved-recovers';
      const { result } = setup({ tableId });
      act(() => result.current.setVisible('description', false));
      setItem.mockRestore();
      act(() => result.current.setPinned(true));
      expect(
        JSON.parse(window.localStorage.getItem(keyFor(tableId)) ?? 'null'),
      ).toEqual({
        v: 1,
        visible: ['name', 'domain'],
        order: ['name', 'description', 'domain', 'license'],
        pinned: true,
      });
    });

    it('lets a value another tab stored win over the unsaved one', () => {
      const tableId = 'unsaved-other-tab';
      const key = keyFor(tableId);
      const { result } = setup({ tableId });
      act(() => result.current.setVisible('description', false));
      setItem.mockRestore();
      act(() => {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            v: 1,
            visible: ['name', 'license'],
            order: ['name', 'description', 'domain', 'license'],
          }),
        );
        window.dispatchEvent(new StorageEvent('storage', { key }));
      });
      expect(result.current.visibleIds).toEqual(['name', 'license']);
    });
  });

  describe('legacy keys', () => {
    const legacyKeys = { visible: 'old-visible', order: 'old-order' };

    it('migrates visibility from a legacy key with no stored order', () => {
      window.localStorage.setItem('old-visible', JSON.stringify(['domain']));
      const { result } = setup({ legacyKeys });
      // Required column restored; columns the old popover knew stay hidden.
      expect(result.current.visibleIds).toEqual(['name', 'domain']);
    });

    it('migrates visibility and order, treating unknown columns as new', () => {
      window.localStorage.setItem(
        'old-visible',
        JSON.stringify(['domain', 'name']),
      );
      window.localStorage.setItem(
        'old-order',
        JSON.stringify(['domain', 'name']),
      );
      const { result } = setup({ legacyKeys });
      // Each new column lands after its nearest predecessor in the default
      // order: description after name, license after domain.
      expect(result.current.order).toEqual([
        'name',
        'domain',
        'license',
        'description',
      ]);
      expect(result.current.visibleIds).toEqual([
        'name',
        'domain',
        'description',
      ]);
    });

    it('treats an empty legacy selection as the defaults', () => {
      window.localStorage.setItem('old-visible', JSON.stringify([]));
      const { result } = setup({ legacyKeys });
      expect(result.current.visibleIds).toEqual([
        'name',
        'description',
        'domain',
      ]);
    });

    it('writes the v1 key and removes the legacy keys on the first change', () => {
      window.localStorage.setItem('old-visible', JSON.stringify(['domain']));
      window.localStorage.setItem(
        'old-order',
        JSON.stringify(['name', 'domain', 'description', 'license']),
      );
      const { result } = setup({ legacyKeys });
      act(() => result.current.setVisible('license', true));
      expect(window.localStorage.getItem('old-visible')).toBeNull();
      expect(window.localStorage.getItem('old-order')).toBeNull();
      expect(stored().visible).toEqual(['name', 'domain', 'license']);
    });
  });
});
