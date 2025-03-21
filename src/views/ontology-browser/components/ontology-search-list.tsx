import React from 'react';
import NextLink from 'next/link';
import {
  Box,
  Button,
  Flex,
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
  const queryString = router?.query?.q || '';
  const search_ids = searchList
    .map(item => item.taxonId)
    .join(' AND _meta.lineage.taxon:');
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
              pr={0}
            >
              {/*<--- Search List --->*/}
              <Flex justifyContent='flex-end' w='100%' px={4} py={2}>
                <Button
                  size='sm'
                  onClick={() => setSearchList([])}
                  variant='link'
                >
                  Clear all
                </Button>
              </Flex>

              {/* Search list */}
              <Box flex={1} w='100%' flexDirection='column' bg='white'>
                {isOpen &&
                  searchList.map(({ taxonId, ontologyName, label }, index) => (
                    <Flex
                      key={`${ontologyName}-${taxonId}`}
                      px={2}
                      pl={6}
                      py={1}
                      bg={index % 2 ? 'niaid.50' : 'transparent'}
                      alignItems='center'
                    >
                      <Flex
                        flex={1}
                        fontWeight='normal'
                        lineHeight='short'
                        textAlign='left'
                        wordBreak='break-word'
                        alignItems='center'
                        justifyContent='space-between'
                      >
                        <Text color='gray.800' fontSize='12px'>
                          {ontologyName} | {taxonId}
                        </Text>
                        <Text
                          color='text.body'
                          fontSize='xs'
                          fontWeight='medium'
                          lineHeight='inherit'
                        >
                          {label}
                        </Text>
                      </Flex>
                      <Flex alignItems='center'>
                        <IconButton
                          ml={4}
                          aria-label={`remove ${label} from search`}
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
                  ))}
              </Box>

              <Text mt={4} px={6} lineHeight='short' fontSize='sm'>
                Search for resources associated with{' '}
                {searchList.map((item, idx) => {
                  return (
                    <React.Fragment key={item.taxonId}>
                      <Text as='span' fontWeight='semibold'>
                        {item.label}
                      </Text>
                      <Text as='span' fontStyle='italic'>
                        {idx < searchList.length - 1 ? ' and ' : '.'}
                      </Text>
                    </React.Fragment>
                  );
                })}
              </Text>
              <Flex justifyContent='flex-end' px={4}>
                <Button
                  as={NextLink}
                  href={{
                    pathname: `/search`,
                    query: {
                      q: `${
                        queryString ? queryString + ' AND ' : ''
                      }_meta.lineage.taxon:${search_ids}`,
                    },
                  }}
                  leftIcon={<FaMagnifyingGlass />}
                  mt={2}
                  size='sm'
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
