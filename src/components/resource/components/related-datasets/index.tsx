import React from 'react';
import {useQuery} from 'react-query';
import {useLocalStorage} from 'usehooks-ts';
import {Link, Skeleton, Text, UnorderedList, ListItem} from 'nde-design-system';
import {fetchSearchResults} from 'src/utils/api';
import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import {StyledSectionHeading, StyledSectionHead} from '../../styles';

interface RelatedDatasets {}

const RelatedDatasets: React.FC<RelatedDatasets> = () => {
  // Fetch search term from local storage
  const [searchQuery] = useLocalStorage('nde-search-query', '');
  const {isLoading, error, data} = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(['search-results', {}], () => fetchSearchResults({q: 'cancer'}));

  return (
    <Skeleton isLoaded={!isLoading} py={[0, 0, 4]}>
      <StyledSectionHead>
        <StyledSectionHeading>Related datasets:</StyledSectionHeading>
      </StyledSectionHead>
      <UnorderedList p={[4, 4, 0]} m={[2, 2, 4]}>
        {data?.results.slice(0, 3).map((resource: FormattedResource) => {
          return (
            <ListItem key={resource.name} py={3}>
              <Link
                href={`/resources/${resource.id}`}
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
