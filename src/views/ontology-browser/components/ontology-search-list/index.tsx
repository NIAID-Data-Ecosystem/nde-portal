import React from 'react';
import NextLink from 'next/link';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Radio,
  RadioGroup,
  Tag,
  TagLabel,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { FaAnglesRight, FaMagnifyingGlass, FaX } from 'react-icons/fa6';
import { useRouter } from 'next/router';
import { ScrollContainer } from 'src/components/scroll-container';
import { SearchListItem } from 'src/pages/ontology-browser';
import { ListToggle } from './toggle';

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
  const [union, setUnion] = React.useState<string>('OR');

  if (!searchList.length) {
    return <></>;
  }

  const queryString = router?.query?.q || '';
  const search_ids = searchList
    .map(item => item.taxonId)
    .join(` ${union} _meta.lineage.taxon:`);
  return (
    <>
      <Flex
        className='onto-search-list-sidebar'
        ml={4}
        justifyContent='flex-end'
        borderRadius='semi'
        overflow='hidden'
      >
        {/* Toggle for opening the list*/}
        <ListToggle
          isOpen={isOpen}
          toggleOpen={isOpen ? onClose : onOpen}
          label='Expand list of selected search terms'
        />
        {/* List of terms to search */}
        <Box
          className='onto-search-list-content'
          minWidth={300}
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
          left={0}
          right={0}
          zIndex='modal'
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
              {/* Search Options */}
              <Flex justifyContent='space-between' w='100%' px={4} py={2}>
                <Flex fontSize='sm'>
                  <RadioGroup
                    onChange={setUnion}
                    value={union}
                    size='sm'
                    isDisabled={searchList.length <= 1}
                  >
                    <HStack fontSize='sm'>
                      <Radio value='OR'>Match Any</Radio>
                      <Radio value='AND'>Match All</Radio>
                    </HStack>
                  </RadioGroup>
                </Flex>
                {/* Clear search */}
                <Button
                  size='sm'
                  onClick={() => setSearchList([])}
                  variant='link'
                >
                  Clear all
                </Button>
              </Flex>

              {/* Search list */}
              <Box as='ul' flex={1} w='100%' flexDirection='column' bg='white'>
                {isOpen &&
                  searchList.map(({ taxonId, ontologyName, label }, index) => (
                    <>
                      <Flex
                        as='li'
                        key={`${ontologyName}-${taxonId}`}
                        px={2}
                        pl={8}
                        py={4}
                        bg={index % 2 ? 'niaid.50' : 'transparent'}
                        alignItems='center'
                        position='relative'
                      >
                        {index !== 0 && (
                          <Tag
                            position='absolute'
                            top={0}
                            left={2}
                            transform={'translateY(-50%)'}
                            size='sm'
                            colorScheme='niaid'
                            variant='subtle'
                          >
                            <TagLabel fontSize='12px'>{union}</TagLabel>
                          </Tag>
                        )}
                        <Flex
                          flex={1}
                          fontWeight='normal'
                          lineHeight='shorter'
                          textAlign='left'
                          wordBreak='break-word'
                          justifyContent='space-between'
                          flexDirection='column'
                        >
                          <Text color='gray.800' fontSize='12px'>
                            {ontologyName} | {taxonId}
                          </Text>
                          <Text
                            color='text.body'
                            fontWeight='medium'
                            lineHeight='inherit'
                            fontSize='sm'
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
                    </>
                  ))}
              </Box>

              {/* Query summary */}
              {/* <Text mt={4} px={6} lineHeight='short' fontSize='sm'>
                Search for resources associated with: <br />
                {searchList.map((item, idx) => {
                  return (
                    <React.Fragment key={item.taxonId}>
                      <Text as='span' fontWeight='semibold'>
                        {item.label}
                      </Text>
                      <br />
                      <Text as='span'>
                        {idx < searchList.length - 1 ? ` ${union} ` : ''}
                      </Text>
                      <br />
                    </React.Fragment>
                  );
                })}
              </Text> */}

              {/* Search button */}
              <Flex justifyContent='flex-end' px={4}>
                <Button
                  as={NextLink}
                  href={{
                    pathname: `/search`,
                    query: {
                      q: `${
                        queryString ? `(${queryString}) AND ` : ''
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
