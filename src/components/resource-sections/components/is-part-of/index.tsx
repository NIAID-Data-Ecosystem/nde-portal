import { FormattedResource } from 'src/utils/api/types';
import { Flex, ListItem, Skeleton, UnorderedList } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import {
  MetadataLabel,
  MetadataTooltip,
  getMetadataDescription,
} from 'src/components/metadata';
import { ScrollContainer } from 'src/components/scroll-container';

interface ResourceIsPartOfProps {
  isLoading: boolean;
  studies?: FormattedResource['isPartOf'];
  type?: FormattedResource['@type'];
}

const ResourceIsPartOf = ({
  studies,
  isLoading,
  type,
}: ResourceIsPartOfProps) => {
  if (!studies || !studies.length) return <></>;

  return (
    <Skeleton isLoaded={!isLoading} mx={1} py={2}>
      <Flex alignItems='baseline' lineHeight='short' mb={1}>
        <MetadataLabel
          label={`Study name ${
            studies.length > 1 ? `(${studies.length})` : ''
          }`}
        />
        <MetadataTooltip
          tooltipLabel={getMetadataDescription('isPartOf', type)}
        />
      </Flex>
      <ScrollContainer overflow='auto' maxHeight='200px'>
        <UnorderedList ml={2}>
          {studies.map(({ name, url }, idx) => {
            if (!name && !url) {
              return null;
            }
            return (
              <ListItem key={`${idx}`} fontSize='sm' lineHeight='short'>
                {url ? (
                  <Link href={url} isExternal>
                    {name}
                  </Link>
                ) : (
                  <>{name}</>
                )}
              </ListItem>
            );
          })}
        </UnorderedList>
      </ScrollContainer>
    </Skeleton>
  );
};

export default ResourceIsPartOf;
