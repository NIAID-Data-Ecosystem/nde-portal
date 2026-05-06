import * as PopoverBarrel from '../index';

describe('popover barrel (index.ts)', () => {
  describe('hooks', () => {
    it('exports useSelectableList as a function', () => {
      expect(typeof PopoverBarrel.useSelectableList).toBe('function');
    });

    it('exports usePopoverSearch as a function', () => {
      expect(typeof PopoverBarrel.usePopoverSearch).toBe('function');
    });
  });

  describe('components', () => {
    it('exports PopoverSearchInput as a function (React component)', () => {
      expect(typeof PopoverBarrel.PopoverSearchInput).toBe('function');
    });

    it('exports PopoverSelectAll as a function (React component)', () => {
      expect(typeof PopoverBarrel.PopoverSelectAll).toBe('function');
    });

    it('exports PopoverEmptyState as a function (React component)', () => {
      expect(typeof PopoverBarrel.PopoverEmptyState).toBe('function');
    });

    it('exports PopoverListItem as a function (React component)', () => {
      expect(typeof PopoverBarrel.PopoverListItem).toBe('function');
    });

    it('exports PopoverSelectableList as a function (React component)', () => {
      expect(typeof PopoverBarrel.PopoverSelectableList).toBe('function');
    });
  });

  it('does not export unexpected names', () => {
    const knownExports = new Set([
      'useSelectableList',
      'usePopoverSearch',
      'PopoverSearchInput',
      'PopoverSelectAll',
      'PopoverEmptyState',
      'PopoverListItem',
      'PopoverSelectableList',
    ]);

    const unexpected = Object.keys(PopoverBarrel).filter(
      name => !knownExports.has(name),
    );

    expect(unexpected).toEqual([]);
  });
});
