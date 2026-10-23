import { Box, Flex, Icon, Image, Text } from '@chakra-ui/react';
import { FaSquareArrowUpRight } from 'react-icons/fa6';
import { Link } from 'src/components/link';

import { MetadataItem } from '../helpers';
import { MetadataButtonGroup, OntologyButton, SearchButton } from './buttons';
import { MetadataWithTag } from './tag';

interface MetadataContentProps extends Omit<MetadataItem, 'key'> {
  includeSearch?: boolean;
  includeOntology?: boolean;
  colorPalette?: string;
}
export const MetadataContent = ({
  name,
  colorPalette,
  img,
  scientificName,
  tags,
  url,
  includeSearch,
  includeOntology,
  ontologyProps,
  searchProps,
}: MetadataContentProps) => {
  // Gate on `value` here rather than inside the buttons: ButtonGroup counts every
  // child element when assigning first/last, so a button that renders nothing
  // would leave its sibling with a squared-off edge.
  const search = includeSearch && searchProps?.value ? searchProps : undefined;
  const ontology =
    includeOntology && ontologyProps?.value ? ontologyProps : undefined;

  return (
    <Flex
      flex={1}
      alignItems='flex-start'
      justifyContent='space-between'
      flexWrap='wrap'
      w='100%'
    >
      <Box flex={1} fontSize='sm' lineHeight='moderate' minW='130px' mx={0.5}>
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
              <Link href={url} isExternal>
                {name}
              </Link>
            ) : (
              <Text fontWeight='normal' wordBreak='break-word' w='100%'>
                {name}
              </Text>
            ))}
        </Flex>
        {tags &&
          tags.map((tag, idx) => (
            <MetadataWithTag key={idx} colorPalette={colorPalette} {...tag} />
          ))}
      </Box>

      {(search || ontology) && (
        <MetadataButtonGroup>
          {search && <SearchButton {...search} />}
          {ontology && <OntologyButton {...ontology} />}
        </MetadataButtonGroup>
      )}
    </Flex>
  );
};
