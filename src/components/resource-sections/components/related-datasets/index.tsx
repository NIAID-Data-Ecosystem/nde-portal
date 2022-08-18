import React from 'react';
import { useQuery } from 'react-query';
import { Link, Skeleton, UnorderedList, ListItem } from 'nde-design-system';
import { fetchSearchResults } from 'src/utils/api';
import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import { StyledSectionHeading, StyledSectionHead } from '../../styles';
import { basePath } from 'next.config';
import NextLink from 'next/link';

interface RelatedDatasets {}

const RelatedDatasets: React.FC<RelatedDatasets> = () => {
  return <></>;
  // const { isLoading, error, data } = useQuery<
  //   FetchSearchResultsResponse | undefined,
  //   Error
  // >(['search-results', {}], () => fetchSearchResults());

  // return (
  //   <Skeleton isLoaded={!isLoading} py={[0, 0, 4]}>
  //     <StyledSectionHead>
  //       <StyledSectionHeading>Related datasets:</StyledSectionHeading>
  //     </StyledSectionHead>
  //     <UnorderedList p={[4, 4, 0]} m={[2, 2, 4]}>
  //       {data?.results.slice(0, 3).map((resource: FormattedResource) => {
  //         return (
  //           <ListItem key={resource.name} py={3}>
  //             <NextLink
  //               href={{
  //                 pathname: '/resources/',
  //                 query: { id: resource.id },
  //               }}
  //               passHref
  //             >
  //               <Link my={2} isExternal border={'none'}>
  //                 {resource.name}
  //               </Link>
  //             </NextLink>
  //           </ListItem>
  //         );
  //       })}
  //     </UnorderedList>
  //   </Skeleton>
  // );
};

export default RelatedDatasets;
