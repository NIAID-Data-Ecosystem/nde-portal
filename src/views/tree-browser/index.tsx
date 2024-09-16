import { useRouter } from 'next/router';
import { useState } from 'react';

interface TreeBrowserOneProps {}
export const TreeBrowserOne = ({}: TreeBrowserOneProps) => {
  const router = useRouter();
  const { id } = router.query;
  // const [selectedFacetID, setSelectedFacetID] = useState(config[0]._id);
  // const [selectedTopic, setSelectedTopic] = useState<TreeNode | null>(null);

  // const {
  //   results: queryResults,
  //   error,
  //   isLoading,
  //   isUpdating,
  // } = useFilterQueries({
  //   initialParams: {
  //     q: queryParams.q,
  //   },
  //   updateParams: queryParams,
  //   config,
  // });

  // const data = (queryResults &&
  //   queryResults[selectedFacetID]?.data) as OLSOntologyResponse[];

  // const tree = data && transformAncestorsArraysToTree(data);

  return <>Trre bwero</>;
};
