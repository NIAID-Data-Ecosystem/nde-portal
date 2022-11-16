import type { DragItem } from './components/SortableWithCombine';

export const convertObject2QueryString = (items: DragItem[]) => {
  const reduceQueryString = (items: DragItem[]) =>
    items.reduce((r, item, i) => {
      const union = `${item.value.union ? ` ${item.value.union} ` : ''}`;
      if (item.children.length > 0) {
        r += `${union}(${reduceQueryString(item.children)})`;
      } else {
        let str = '';
        if (item.value.field) {
          str += `${item.value.field}: `;
        }
        str += item.value.term;
        r += `${union}(${str})`;
      }

      return r;
    }, '');

  return reduceQueryString(items);
};
