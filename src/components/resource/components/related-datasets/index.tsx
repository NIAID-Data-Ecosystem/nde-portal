import React from 'react';
import {useQuery} from 'react-query';
import {useLocalStorage} from 'usehooks-ts';
import {Link, Skeleton, Text, UnorderedList, ListItem} from 'nde-design-system';
import {getSearchResults} from 'src/utils/api';
import {SearchResultsData} from 'src/utils/api/types';
import {StyledSectionHeading, StyledSectionHead} from '../../styles';

interface RelatedDatasets {}

const RelatedDatasets: React.FC<RelatedDatasets> = () => {
  // Fetch search term from local storage
  const [searchQuery] = useLocalStorage('nde-search-query', '');

  const {isLoading, error, data} = useQuery<SearchResultsData, Error>(
    ['search-results', {searchQuery}],
    () => getSearchResults(searchQuery),
  );

  return (
    <Skeleton isLoaded={!isLoading} py={[0, 0, 4]}>
      <StyledSectionHead>
        <StyledSectionHeading>Related datasets:</StyledSectionHeading>
      </StyledSectionHead>
      <UnorderedList p={[4, 4, 0]} m={[2, 2, 4]}>
        {data?.hits.slice(0, 3).map(resource => {
          return (
            <ListItem key={resource.name} py={3}>
              <Link
                href={`/resources/${resource._id}`}
                my={2}
                isExternal
                border={'none'}
              >
                {resource.name}
              </Link>
            </ListItem>
          );
        })}
      </UnorderedList>
    </Skeleton>
  );
};

export default RelatedDatasets;
