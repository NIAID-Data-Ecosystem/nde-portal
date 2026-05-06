import type { PopoverItem, PopoverItemGroup } from '../types';

describe('PopoverItem type', () => {
  it('accepts an object with required fields id and title', () => {
    const item: PopoverItem = { id: 'col-1', title: 'Name' };
    expect(item.id).toBe('col-1');
    expect(item.title).toBe('Name');
  });

  it('accepts an optional groupKey field', () => {
    const item: PopoverItem = {
      id: 'col-2',
      title: 'Status',
      groupKey: 'Meta',
    };
    expect(item.groupKey).toBe('Meta');
  });

  it('allows groupKey to be omitted', () => {
    const item: PopoverItem = { id: 'col-3', title: 'Date' };
    expect(item.groupKey).toBeUndefined();
  });
});

describe('PopoverItemGroup type', () => {
  it('accepts a valid group with a string key and a PopoverItem array', () => {
    const group: PopoverItemGroup = {
      groupKey: 'Core',
      items: [
        { id: 'a', title: 'Alpha' },
        { id: 'b', title: 'Beta', groupKey: 'Core' },
      ],
    };
    expect(group.groupKey).toBe('Core');
    expect(group.items).toHaveLength(2);
  });

  it('accepts a group with an empty items array', () => {
    const group: PopoverItemGroup = { groupKey: '', items: [] };
    expect(group.items).toHaveLength(0);
  });
});
