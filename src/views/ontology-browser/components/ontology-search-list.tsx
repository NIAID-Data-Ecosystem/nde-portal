import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FaAnglesLeft,
  FaAnglesRight,
  FaMagnifyingGlass,
  FaX,
} from 'react-icons/fa6';
import Tooltip from 'src/components/tooltip';
import { useRouter } from 'next/router';
import { ScrollContainer } from 'src/components/scroll-container';
import { SearchListItem } from 'src/pages/ontology-browser';
import {
  getTooltipLabelByCountType,
  OntologyBrowserCountTag,
} from './ontology-browser-count-tag';

const WIDTH = 400;

export const OntologySearchList = ({
  searchList,
  setSearchList,
}: {
  searchList: SearchListItem[];
  setSearchList: React.Dispatch<React.SetStateAction<SearchListItem[]>>;
}) => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  if (!searchList.length) {
    return <></>;
  }

  return (
    <>
      <Flex
        className='onto-search-list-sidebar'
        ml={4}
        justifyContent='flex-end'
        borderRadius='semi'
        overflow='hidden'
      >
        {!isOpen && (
          <Tooltip label='Expand list of selected search terms'>
            <Button
              aria-label='Expand list of selected search terms'
              onClick={onOpen}
              size='sm'
              colorScheme='gray'
              bg='white'
              variant='ghost'
              height={{ base: 'auto', lg: '100%' }}
            >
              <Text display={{ base: 'block', lg: 'none' }} mr={2}>
                Toggle Search List
              </Text>
              <Box>
                <Icon as={FaMagnifyingGlass} />
                <Icon
                  display={{ base: 'none', lg: 'block' }}
                  as={FaAnglesLeft}
                  fill='gray.600'
                  mt={4}
                />
              </Box>
            </Button>
          </Tooltip>
        )}
        <Box
          className='onto-search-list-content'
          bg='white'
          w={isOpen ? { base: '100%', lg: `${WIDTH}px` } : '0px'}
          h={isOpen ? { base: 'auto', lg: 'auto' } : '0px'}
          transform={isOpen ? 'translateX(0)' : 'translateX(100%)'}
          maxW={{ base: 'auto', lg: `${WIDTH}px` }}
          transitionDuration='fast'
          transitionProperty='width, transform'
          transitionTimingFunction='ease'
          position={{ base: 'fixed', lg: 'unset' }}
          top={0}
          right={0}
          zIndex='popover'
        >
          <Flex
            h='100%'
            flexDirection='column'
            overflow={isOpen ? 'visible' : 'hidden'}
          >
            <Button
              aria-label='Collapse selected search terms list'
              onClick={onClose}
              colorScheme='gray'
              variant='ghost'
              borderRadius='none'
              alignItems='center'
              justifyContent='space-between'
            >
              <Icon as={FaMagnifyingGlass} />

              <Text fontSize='sm' fontWeight='medium'>
                List of selected search terms
              </Text>
              <Icon as={FaAnglesRight} ml={4} fill='gray.600' />
            </Button>
            <ScrollContainer
              as='aside'
              overflowX='hidden'
              overflowY='auto'
              h='100%'
              borderTop='1px solid'
              borderColor='gray.200'
              pb={4}
              px={6}
            >
              {/*<--- Search List --->*/}
              <Flex justifyContent='flex-end' w='100%' px={1} py={2}>
                <Button
                  size='sm'
                  onClick={() => setSearchList([])}
                  variant='link'
                >
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
              >
                {isOpen &&
                  searchList.map(
                    ({ taxonId, counts, ontologyName, label }, index) => (
                      <Flex
                        key={`${ontologyName}-${taxonId}`}
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
                            {taxonId}
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
                        <Flex>
                          <OntologyBrowserCountTag
                            colorScheme={counts.term === 0 ? 'gray' : 'primary'}
                            label={getTooltipLabelByCountType('term')}
                          >
                            {counts.term?.toLocaleString() || 0}
                          </OntologyBrowserCountTag>

                          <OntologyBrowserCountTag
                            colorScheme={'white'}
                            label={getTooltipLabelByCountType('lineage')}
                          >
                            {'/ ' + counts.lineage?.toLocaleString() || 0}
                          </OntologyBrowserCountTag>

                          <IconButton
                            ml={1}
                            aria-label='remove item from search'
                            icon={<Icon as={FaX} boxSize={2.5} />}
                            variant='ghost'
                            colorScheme='gray'
                            size='sm'
                            p={1}
                            boxSize={6}
                            minWidth={6}
                            onClick={() => {
                              setSearchList(prev =>
                                prev.filter(item => item.label !== label),
                              );
                            }}
                          />
                        </Flex>
                      </Flex>
                    ),
                  )}
              </Box>
              <Flex justifyContent='flex-end'>
                <Button
                  mt={2}
                  leftIcon={<FaMagnifyingGlass />}
                  size='sm'
                  onClick={() => {
                    const queryString = router?.query?.q || '';
                    const ids = searchList
                      .map(item => item.taxonId)
                      .join(' AND _meta.lineage.taxon:');

                    router.push({
                      pathname: `/search`,
                      query: {
                        q: `${
                          queryString ? queryString + ' AND ' : ''
                        }_meta.lineage.taxon:${ids}`,
                      },
                    });
                  }}
                >
                  Search resources
                </Button>
              </Flex>
            </ScrollContainer>
          </Flex>
        </Box>
      </Flex>
    </>
  );
};
