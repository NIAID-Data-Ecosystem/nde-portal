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
  Tooltip,
  HStack,
} from 'nde-design-system';
import { Link as ChakraLink } from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import { formatAuthorsList2String } from 'src/utils/helpers';
import {
  FaMinus,
  FaPlus,
  FaRegEnvelope,
  FaRegWindowMaximize,
} from 'react-icons/fa';

// An accordion containing author details such as name and affiliation + link to their profile pages if available.
const ResourceAuthors = ({
  authors,
}: {
  authors: FormattedResource['author'];
}) => {
  if (!authors) {
    return null;
  }
  // We'll display the authors in list form if authors have additional details in the expand drawer.
  const authors_have_details =
    authors.filter(author => {
      return (
        author?.affiliation?.name ||
        author.email ||
        author.url ||
        author.role ||
        author.identifier
      );
    }).length > 0;

  // Check if ORCID url is in the identifier. Prepend it if missing.
  const formatOrcid = (id: string) => {
    if (id.includes('http://orcid.org/')) {
      return id;
    } else {
      return `http://orcid.org/${id.replace(/^\//g, '')}`;
    }
  };

  const OrcidLink = ({ url }: { url: string }) => {
    return (
      <ChakraLink
        href={formatOrcid(url)}
        target='_blank'
        display='flex'
        alignItems='center'
      >
        {/* Handle if the url corresponds to an ORCID. */}
        <Image
          display='inline'
          boxSize='1rem'
          objectFit='contain'
          src='https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png'
          alt='ORCID logo'
          minW='1rem'
        />
      </ChakraLink>
    );
  };

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
                display={authors_have_details ? '' : 'inline-flex'}
                flexWrap='wrap'
              >
                {authors.map((author, i) => {
                  let { identifier, name, url, email } = author;

                  let authors_str =
                    formatAuthorsList2String(authors).split(',');
                  return (
                    <ListItem
                      key={`${i}-${name}`}
                      display='flex'
                      alignItems='center'
                      mr={1}
                      flexWrap='wrap'
                    >
                      {/* Author name. */}
                      <Text>
                        <strong>{authors_str[i]}</strong>
                      </Text>

                      {author.role ? (
                        <>
                          <Text ml={1}>{author.role}</Text>
                        </>
                      ) : (
                        <></>
                      )}

                      {(url || identifier || email) && (
                        <HStack
                          spacing={2}
                          mx={1}
                          pl={1.5}
                          align='center'
                          borderLeft='1px solid'
                          borderLeftColor='primary.500'
                        >
                          {/* Author contact URLs(website, email, orcid). */}
                          {url &&
                            (url?.includes('orcid') ? (
                              <OrcidLink url={url} />
                            ) : (
                              <Tooltip label='Website'>
                                <ChakraLink
                                  href={url}
                                  as='a'
                                  target='_blank'
                                  display='flex'
                                  alignItems='center'
                                >
                                  <Icon
                                    as={FaRegWindowMaximize}
                                    aria-label='Personal website.'
                                  />
                                </ChakraLink>
                              </Tooltip>
                            ))}

                          {email && (
                            <ChakraLink
                              href={`mailto:${email}`}
                              display='flex'
                              alignItems='center'
                            >
                              <Icon as={FaRegEnvelope} />
                            </ChakraLink>
                          )}

                          {/* Display author id if it's ORCID: */}
                          {identifier && identifier?.includes('orcid') && (
                            <OrcidLink url={identifier} />
                          )}
                        </HStack>
                      )}

                      {/* Author Affiliation. */}
                      {author.affiliation?.name ? (
                        <Text>
                          {', '}
                          {author.affiliation.sameAs ? (
                            <>
                              <Link
                                href={author.affiliation.sameAs}
                                isExternal
                                sx={{
                                  svg: { marginLeft: '0.25rem !important' },
                                }}
                              >
                                {name
                                  ? `${author.affiliation.name}`
                                  : author.affiliation.name}
                              </Link>
                            </>
                          ) : (
                            <>
                              {name
                                ? `${author.affiliation.name}`
                                : author.affiliation.name}
                            </>
                          )}{' '}
                        </Text>
                      ) : (
                        ''
                      )}

                      {/* Append punctuation when not in vertical list form. */}
                      {authors_have_details
                        ? ''
                        : i === authors.length - 1
                        ? '.'
                        : ','}
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
