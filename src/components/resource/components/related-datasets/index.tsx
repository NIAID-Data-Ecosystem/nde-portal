import React from 'react';
import {Link, Skeleton, Text} from 'nde-design-system';

import {getSearchResults} from 'src/utils/api';
import {SearchResultsData} from 'src/utils/api/types';
import {useQuery} from 'react-query';
import {useLocalStorage} from 'usehooks-ts';

interface RelatedDatasets {}

const RelatedDatasets: React.FC<RelatedDatasets> = () => {
  // Fetch search term from local storage
  const [searchQuery] = useLocalStorage('nde-search-query', '');

  const {isLoading, error, data} = useQuery<SearchResultsData, Error>(
    ['search-results', {searchQuery}],
    () => getSearchResults(searchQuery),
  );

  return (
    <Skeleton isLoaded={!isLoading}>
      <Text fontSize='xs' display='flex' alignItems='center'>
        Related datasets:
      </Text>
      {data?.hits.slice(0, 3).map(resource => {
        return (
          <Link
            key={resource.name}
            href={`/resources/${resource._id}`}
            my={2}
            isExternal
            border={'none'}
            _hover={{
              borderBottom: 'none!important',
              textDecoration: 'underline!important',
            }}
          >
            {resource.name}
          </Link>
        );
      })}
    </Skeleton>
  );
};

export default RelatedDatasets;
