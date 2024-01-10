import { Box, Flex, Icon, Image, Link, Text } from 'nde-design-system';
import { MetadataItem } from '../helpers';
import { MetadataWithTag } from './tag';
import { MetadataButtonGroup, OntologyButton, SearchButton } from './buttons';
import { FaExternalLinkSquareAlt } from 'react-icons/fa';

interface MetadataContentProps extends Omit<MetadataItem, 'key'> {
  includeSearch?: boolean;
  includeOntology?: boolean;
}
export const MetadataContent = ({
  name,
  img,
  scientificName,
  tags,
  url,
  includeSearch,
  includeOntology,
  ontologyProps,
  searchProps,
}: MetadataContentProps) => {
  return (
    <Flex
      flex={1}
      alignItems='flex-start'
      justifyContent='space-between'
      flexWrap='wrap'
    >
      <Box flex={1} fontSize='xs' lineHeight='short' minW={150}>
        {scientificName && <Text fontWeight='semibold'>{scientificName}</Text>}
        <Flex>
          {img && (
            <Image
              my={1}
              mr={2}
              width='auto'
              height={5}
              src={img.src}
              alt={img.alt}
            />
          )}
          {name &&
            (url ? (
              <Link href={url} target='_blank' alignItems='center'>
                <Text>{name}</Text>
                <Icon
                  as={FaExternalLinkSquareAlt}
                  boxSize={2.5}
                  ml={1}
                  color='gray.800'
                />
              </Link>
            ) : (
              <Text fontWeight='normal'>{name}</Text>
            ))}
        </Flex>
        {tags && tags.map((tag, idx) => <MetadataWithTag key={idx} {...tag} />)}
      </Box>
      {((includeSearch && searchProps) ||
        (includeOntology && ontologyProps)) && (
        <MetadataButtonGroup mx={1}>
          {includeSearch && searchProps && <SearchButton {...searchProps} />}
          {includeOntology && ontologyProps && (
            <OntologyButton {...ontologyProps} />
          )}
        </MetadataButtonGroup>
      )}
    </Flex>
  );
};
