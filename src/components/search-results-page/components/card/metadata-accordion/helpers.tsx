import { FormattedResource } from 'src/utils/api/types';

export const getFundingDetails = (funding?: FormattedResource['funding']) => {
  if (!funding) return null;
  return (
    funding?.filter(funding => {
      return (
        funding.identifier ||
        funding.url ||
        Array.isArray(funding.funder) ||
        funding.funder?.name
      );
    }) || null
  );
};

interface Metadata {
  label: string;
  property: string;
  isDisabled: boolean;
  content: (args: { property: string }) => React.JSX.Element;
}
export const sortMetadataArray = (arr: Metadata[], sort_order: string[]) => {
  // Sort function that respects the sortOrder
  const customSort = (a: Metadata, b: Metadata) => {
    let indexA = sort_order.indexOf(a.property);
    let indexB = sort_order.indexOf(b.property);

    // Handle items not in sort_order by putting them at the end
    if (indexA === -1) indexA = sort_order.length;
    if (indexB === -1) indexB = sort_order.length;

    return indexA - indexB;
  };

  // Separate the disabled and non-disabled items
  const enabledItems = arr.filter(item => !item.isDisabled).sort(customSort);
  const disabledItems = arr.filter(item => item.isDisabled).sort(customSort);

  // Concatenate the sorted enabled items with the sorted disabled items
  return [...enabledItems, ...disabledItems];
};
