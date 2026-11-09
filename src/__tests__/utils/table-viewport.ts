/*
A virtualized DataTable (`virtualize`) mounts only the rows that fit in its
scroll viewport, and jsdom has no layout: every element is 0px tall, so it
would mount none. These give the table's viewport (the element directly around
its <table>), and optionally its rows, a height, and leave every other element
at jsdom's 0. Restore them with `mockRestore()` (or `jest.restoreAllMocks()`).
*/

/** The table viewport's visible height. */
export const mockTableViewportHeight = (height = 800) =>
  jest
    .spyOn(Element.prototype, 'clientHeight', 'get')
    .mockImplementation(function (this: Element) {
      return this.firstElementChild?.tagName === 'TABLE' ? height : 0;
    });

/** Every body row's measured height (jsdom reports 0, so all rows "fit"). */
export const mockTableRowHeight = (height = 100) =>
  jest
    .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
    .mockImplementation(function (this: HTMLElement) {
      return this.tagName === 'TR' && this.parentElement?.tagName === 'TBODY'
        ? height
        : 0;
    });
