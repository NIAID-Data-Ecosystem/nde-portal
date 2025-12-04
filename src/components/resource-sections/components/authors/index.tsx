import React from 'react';
import {
  Accordion,
  Box,
  Link as ChakraLink,
  Flex,
  Heading,
  Icon,
  Text,
  List,
  Image,
  HStack,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { FormattedResource } from 'src/utils/api/types';
import { formatAuthorsList2String } from 'src/utils/helpers/authors';
import {
  FaMinus,
  FaPlus,
  FaRegEnvelope,
  FaRegWindowMaximize,
} from 'react-icons/fa6';
import { Tooltip } from 'src/components/tooltip';

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
    if (id.includes('http://orcid.org/') || id.includes('https://orcid.org/')) {
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
    <Accordion.Root collapsible lazyMount>
      <Accordion.Item borderTopColor='transparent' value='authors'>
        <Accordion.ItemTrigger
          px={[4, 6]}
          _hover={{ bg: 'page.alt' }}
          _open={{
            '& .open-text': {
              display: 'none',
            },
            '& .close-text': {
              display: 'inline',
            },
          }}
          _closed={{
            '& .open-text': {
              display: 'inline',
            },
            '& .close-text': {
              display: 'none',
            },
          }}
        >
          <Flex
            w='100%'
            direction={['column', 'column', 'row']}
            justifyContent='space-between'
            alignItems='flex-end'
          >
            <Heading
              fontSize='sm'
              color='gray.700'
              fontWeight='light'
              lineHeight='short'
              textAlign='left'
              mr={6}
              flex='1'
            >
              {formatAuthorsList2String(authors, ',', 10)}
              {authors.length === 1 ? '' : '.'}
            </Heading>
            <Flex
              gap={2}
              alignItems='center'
              _hover={{ textDecoration: 'underline' }}
            >
              <Text fontSize='xs' className='open-text'>
                Expand
              </Text>
              <Text fontSize='xs' className='close-text'>
                Collapse
              </Text>
              <Accordion.ItemIndicator
                as={FaPlus}
                _open={{ display: 'none' }}
              />
              <Accordion.ItemIndicator
                as={FaMinus}
                _closed={{ display: 'none' }}
              />
            </Flex>
          </Flex>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent px={[1, 4, 6]} py={4} bg='page.alt'>
          <Accordion.ItemBody p={0}>
            <List.Root
              display={authors_have_details ? '' : 'inline-flex'}
              flexWrap='wrap'
            >
              {authors.map((author, i) => {
                let { identifier, name, url, email } = author;

                let authors_str = formatAuthorsList2String(authors).split(',');
                return (
                  <List.Item
                    key={`${i}-${name}`}
                    display='flex'
                    alignItems='center'
                    mr={1}
                    flexWrap='wrap'
                    lineHeight='short'
                  >
                    {/* Author name. */}
                    <Text lineHeight='inherit'>
                      <strong>{authors_str[i]}</strong>
                    </Text>

                    {author.role ? (
                      <Text ml={1} lineHeight='inherit'>
                        {author.role}
                      </Text>
                    ) : (
                      <></>
                    )}

                    {(url || identifier || email) && (
                      <HStack
                        align='center'
                        borderLeft='1px solid'
                        borderLeftColor='primary.500'
                        lineHeight='inherit'
                      >
                        {/* Author contact URLs(website, email, orcid). */}
                        {url &&
                          (url?.includes('orcid') ? (
                            <OrcidLink url={url} />
                          ) : (
                            <Tooltip content='Website'>
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
                      <>
                        {','}&nbsp;
                        {author.affiliation.sameAs ? (
                          <Link
                            href={author.affiliation.sameAs}
                            isExternal
                            css={{
                              '& svg': { marginLeft: '0.25rem !important' },
                            }}
                            ml={1}
                          >
                            {name
                              ? `${author.affiliation.name}`
                              : author.affiliation.name}
                          </Link>
                        ) : (
                          <Text lineHeight='inherit'>
                            {name
                              ? `${author.affiliation.name}`
                              : author.affiliation.name}
                          </Text>
                        )}{' '}
                      </>
                    ) : (
                      ''
                    )}

                    {/* Append punctuation when not in vertical list form. */}
                    {authors_have_details
                      ? ''
                      : i === authors.length - 1
                      ? '.'
                      : ','}
                  </List.Item>
                );
              })}
            </List.Root>
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  );
};

export default ResourceAuthors;
