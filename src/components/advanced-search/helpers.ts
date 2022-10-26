import { DragItem } from './components/DraggableItem';

export const transformQueryArray2Querystring = (queryItems: DragItem[]) => {
  // leverage queryFilterObject2String for array values

  let querystring = queryItems
    .map(({ field, value }) => {
      if (field === 'union') {
        return ` ${value} `;
      } else if (field) {
        return `${field}:${value}`;
      } else {
        return value;
      }
    })
    .join('');
  return querystring;
};
