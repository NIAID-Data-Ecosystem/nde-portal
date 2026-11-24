import { Skeleton } from '@chakra-ui/react';

/*
 Result counts on the search tabs and their sections. A count is `undefined`
 until it first loads; a later search keeps showing the previous counts until
 its own arrive, so the placeholder only shows on the first load.
*/

/** The total of some counts, or `undefined` while any of them is. */
export const sumCounts = (...counts: (number | undefined)[]) =>
  counts.reduce<number | undefined>(
    (total, count) =>
      total === undefined || count === undefined ? undefined : total + count,
    0,
  );

/** A count, or a placeholder for one that hasn't loaded yet. */
export const Count = ({ count }: { count: number | undefined }) =>
  count === undefined ? (
    <Skeleton
      as='span'
      loading
      display='inline-block'
      width='4ch'
      height='0.8em'
      verticalAlign='middle'
    />
  ) : (
    <>{count.toLocaleString()}</>
  );
