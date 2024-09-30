import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Tag,
  Text,
} from '@chakra-ui/react';
import { FaMagnifyingGlass, FaX } from 'react-icons/fa6';
import Tooltip from 'src/components/tooltip';
import { formatIdentifier } from '../helpers';
import { useRouter } from 'next/router';

interface SearchListItem {
  ontology: string;
  id: string;
  label: string;
  facet: string;
  count?: number;
}

export const OntologyList = ({
  searchList,
  setSearchList,
}: {
  searchList: SearchListItem[];
  setSearchList: React.Dispatch<React.SetStateAction<SearchListItem[]>>;
}) => {
  const router = useRouter();
  return (
    <>
      {/* Search List */}
      <Flex
        className='search-list'
        alignItems='flex-end'
        flexDirection='column'
        maxWidth='350px'
        mt={7}
        ml={searchList?.length > 0 ? 8 : 0}
        overflow={searchList?.length > 0 ? 'auto' : 'hidden'}
        transform={
          searchList?.length > 0 ? 'translateX(0)' : 'translateX(100%)'
        }
        w={searchList?.length > 0 ? '350px' : '0px'}
        transitionDuration='slow'
        transitionProperty='width, transform'
        transitionTimingFunction='ease-in-out'
      >
        <Flex justifyContent='space-between' w='100%' px={1}>
          <Text fontSize='sm' fontWeight='medium' mb={1} lineHeight='tall'>
            List of search values
          </Text>
          <Button size='sm' onClick={() => setSearchList([])} variant='link'>
            Clear all
          </Button>
        </Flex>
        {/* Search list */}
        <Box
          flex={1}
          w='100%'
          flexDirection='column'
          bg='white'
          border='1px solid'
          borderRadius='semi'
          borderColor='niaid.placeholder'
          maxHeight={300}
          overflow='auto'
        >
          {searchList.map(({ id, count, ontology, label }, index) => (
            <Flex
              key={`${ontology}-${id}`}
              px={2}
              py={1}
              bg={index % 2 ? 'primary.50' : 'transparent'}
              alignItems='center'
            >
              <Box
                flex={1}
                fontWeight='normal'
                lineHeight='short'
                textAlign='left'
                wordBreak='break-word'
              >
                <Text color='gray.800' fontSize='12px'>
                  {id}
                </Text>
                <Text
                  color='text.body'
                  fontSize='xs'
                  fontWeight='medium'
                  lineHeight='inherit'
                >
                  {label}
                </Text>
              </Box>
              <Tooltip label='Number of potential matching resources in NIAID Discovery Portal'>
                <Tag
                  borderRadius='full'
                  colorScheme={count === 0 ? 'gray' : 'primary'}
                  variant='subtle'
                  size='sm'
                >
                  {count?.toLocaleString() || 0}
                </Tag>
              </Tooltip>

              <IconButton
                aria-label='remove item from search'
                icon={<Icon as={FaX} boxSize={2.5} />}
                variant='ghost'
                colorScheme='gray'
                size='sm'
                p={1}
                ml={2}
                boxSize={6}
                minWidth={6}
                onClick={() => {
                  setSearchList(prev =>
                    prev.filter(item => item.label !== label),
                  );
                }}
              />
            </Flex>
          ))}
        </Box>
        <Button
          mt={2}
          leftIcon={<FaMagnifyingGlass />}
          size='sm'
          onClick={() => {
            const termsWithFieldsString = searchList.reduce(
              (querystring, node) => {
                const id = formatIdentifier(node);
                const joiner = querystring ? ' AND ' : '';
                return `${querystring}${joiner}${node.facet}:"${id}"`;
              },
              router?.query?.q || '',
            );

            router.push({
              pathname: `/search`,
              query: {
                q: termsWithFieldsString,
              },
            });
          }}
        >
          Search resources
        </Button>
      </Flex>
    </>
  );
};
