import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Flex,
  Heading,
  Icon,
  Link,
  Text,
  UnorderedList,
  ListItem,
  Image,
} from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import {
  formatAuthorsList2String,
  shouldAppendPunctuation,
} from 'src/utils/helpers';
import { FaMinus, FaPlus } from 'react-icons/fa';

// An accordion containing author details such as name and affiliation + link to their profile pages if available.
const ResourceAuthors = ({
  authors,
}: {
  authors: FormattedResource['author'];
}) => {
  if (!authors) {
    return null;
  }
  // Check if there's affiliation information in the author list. This will decide if we display the authors in list form in the expand drawer.
  const authorsHaveAffiliation =
    authors.filter(author => !!author.affiliation).length > 0;

  return (
    <Accordion allowToggle borderColor='gray.100'>
      <AccordionItem>
        {({ isExpanded }) => (
          <>
            <AccordionButton px={[4, 6]} _hover={{ bg: 'page.alt' }}>
              <Flex
                w='100%'
                direction={['column', 'column', 'row']}
                justifyContent='space-between'
              >
                <Box w='100%' flex='1' textAlign='left' mr={6} maxW={700}>
                  <Heading
                    size='sm'
                    fontFamily='body'
                    color='gray.700'
                    fontWeight='semibold'
                  >
                    {formatAuthorsList2String(authors, ',', 10)}
                    {authors.length === 1 ? '' : '.'}
                  </Heading>
                </Box>
                <Flex alignItems='flex-end'>
                  <Flex alignItems='center'>
                    <Text fontSize='xs' fontWeight='light' mx={1}>
                      {isExpanded ? 'collapse' : 'expand'}
                    </Text>
                    <Icon as={isExpanded ? FaMinus : FaPlus} fontSize='xs' />
                  </Flex>
                </Flex>
              </Flex>
            </AccordionButton>
            <AccordionPanel px={[1, 4, 6]} py={4} bg='page.alt'>
              {/* If the author list has an author with affiliation, we display the authors as a vertical list.
              Otherwise, display that authors as a paragraph */}
              <UnorderedList
                display={authorsHaveAffiliation ? '' : 'inline-flex'}
                flexWrap='wrap'
              >
                {authors.map((author, i) => {
                  let url = author?.url;

                  if (!url && author.identifier?.includes('orcid.org')) {
                    url = author.identifier;
                  }

                  let author_strings =
                    formatAuthorsList2String(authors).split(',');

                  return (
                    <ListItem key={`${i}-${author.name}`} display='flex' mr={1}>
                      {/* Author name. */}
                      <Text>
                        <strong>
                          {shouldAppendPunctuation(
                            author_strings[i],
                            !author.affiliation && i === authors.length - 1
                              ? '.'
                              : ',',
                          )}
                        </strong>
                        {author?.affiliation?.name
                          ? ` ${author.affiliation.name}.`
                          : ''}

                        {/* Author website or orcid link. */}
                        {url &&
                          (url?.includes('orcid') ? (
                            <Link href={url} target='_blank' p={1}>
                              {/* If there's an orcid identifier, we link to orcid */}
                              <Image
                                display='inline'
                                boxSize='1rem'
                                objectFit='contain'
                                src='https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png'
                                alt='ORCID logo'
                              />
                            </Link>
                          ) : (
                            <Link
                              href={url}
                              target='_blank'
                              isExternal
                              fontSize='sm'
                              ml={1}
                            >
                              Website
                            </Link>
                          ))}
                      </Text>
                    </ListItem>
                  );
                })}
              </UnorderedList>
            </AccordionPanel>
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
};

export default ResourceAuthors;
