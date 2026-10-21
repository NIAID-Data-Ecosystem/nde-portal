import {
  Accordion,
  Box,
  Heading,
  HStack,
  Icon,
  IconButton,
  IconButtonProps,
  Image,
  Link as ChakraLink,
  List,
  Separator,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { FaGlobe, FaMinus, FaPlus, FaRegEnvelope } from 'react-icons/fa6';
import { Link } from 'src/components/link';
import Tooltip from 'src/components/tooltip';
import { Author, FormattedResource } from 'src/utils/api/types';
import {
  formatAuthorName,
  formatAuthorsList2String,
} from 'src/utils/helpers/authors';

// The collapsed summary names this many authors before truncating to "et al".
const MAX_SUMMARY_AUTHORS = 10;

const isOrcid = (value?: string | null): value is string =>
  !!value?.includes('orcid');

// Prepend the ORCID domain if the identifier is missing it.
const formatOrcid = (id: string) =>
  /https?:\/\/orcid\.org\//.test(id)
    ? id
    : `https://orcid.org/${id.replace(/^\//, '')}`;

// Whether the author has fields that are only shown in the expanded list.
const hasDetails = ({ affiliation, email, url, role, identifier }: Author) =>
  !!(affiliation?.name || email || url || role || isOrcid(identifier));

const ContactLink = ({
  label,
  href,
  isExternal,
  children,
  ...props
}: {
  label: string;
  href: string;
  isExternal?: boolean;
  children: React.ReactNode;
} & IconButtonProps) => (
  <Tooltip content={label}>
    <IconButton
      asChild
      size='2xs'
      colorPalette='blue'
      variant='subtle'
      {...props}
    >
      <ChakraLink
        href={href}
        aria-label={label}
        // display='flex'
        {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {children}
      </ChakraLink>
    </IconButton>
  </Tooltip>
);

// Icon links to the author's website, email and ORCID profile.
const AuthorContacts = ({ url, email, identifier }: Author) => {
  const website = isOrcid(url) ? null : url;
  const orcid = [url, identifier].find(isOrcid);

  if (!website && !email && !orcid) {
    return null;
  }
  return (
    <HStack gap={2} mx={1} pl={1.5}>
      <Separator borderColor='gray.300' height='1rem' orientation='vertical' />

      {website && (
        <ContactLink label='Website' href={website} isExternal>
          <Icon>
            <FaGlobe />
          </Icon>
        </ContactLink>
      )}
      {email && (
        <ContactLink label='Email' href={`mailto:${email}`}>
          <Icon>
            <FaRegEnvelope />
          </Icon>
        </ContactLink>
      )}
      {orcid && (
        <ContactLink
          label='ORCID'
          href={formatOrcid(orcid)}
          isExternal
          colorPalette='green'
        >
          <Image
            src='https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png'
            alt=''
            boxSize={4}
            flexShrink={0}
            objectFit='contain'
          />
        </ContactLink>
      )}
    </HStack>
  );
};

// A summary of the resource's authors that expands into each author's role, contact links and affiliation, when any are available.
const ResourceAuthors = ({
  authors,
}: {
  authors: FormattedResource['author'];
}) => {
  if (!authors?.length) {
    return null;
  }

  // Authors with details get a line each; otherwise the list reads as a sentence.
  const showAsList = authors.some(hasDetails);
  // Only offer to expand when the list shows more than the summary.
  const isExpandable = showAsList || authors.length > MAX_SUMMARY_AUTHORS;

  const summary = (
    <Heading
      flex='1'
      fontSize='sm'
      color='gray.700'
      fontWeight='light'
      lineHeight='moderate'
    >
      {formatAuthorsList2String(authors, ',', MAX_SUMMARY_AUTHORS)}
      {authors.length > 1 && '.'}
    </Heading>
  );

  if (!isExpandable) {
    return (
      <Box px={[4, 6]} py={2}>
        {summary}
      </Box>
    );
  }

  return (
    <Accordion.Root
      collapsible
      lazyMount
      unmountOnExit
      variant='plain'
      fontSize='sm'
      size='sm'
    >
      <Accordion.Item
        value='authors'
        borderY='1px solid'
        borderColor='gray.200'
      >
        <Accordion.ItemTrigger
          px={[4, 6]}
          flexDirection={['column', null, 'row']}
          alignItems={['flex-start', null, 'flex-end']}
          gap={[0, null, 6]}
          bg='white'
          borderRadius='none'
          _hover={{ bg: 'bg.alt' }}
        >
          {summary}
          <Accordion.ItemContext>
            {({ expanded }) => (
              <HStack gap={1} fontSize='xs' fontWeight='light'>
                <Text data-accordion-control>
                  {expanded ? 'hide' : 'show details'}
                </Text>

                <Icon>{expanded ? <FaMinus /> : <FaPlus />}</Icon>
              </HStack>
            )}
          </Accordion.ItemContext>
        </Accordion.ItemTrigger>

        <Accordion.ItemContent>
          <Accordion.ItemBody>
            <List.Root
              flexDirection={showAsList ? 'column' : 'row'}
              flexWrap='wrap'
              lineHeight='moderate'
            >
              {authors.map((author, i) => {
                const { affiliation, role } = author;
                const isLast = i === authors.length - 1;
                return (
                  <List.Item
                    key={i}
                    display='flex'
                    alignItems='center'
                    flexWrap='wrap'
                    mr={1}
                  >
                    <Text fontWeight='medium'>
                      {!showAsList && isLast && 'and '}
                      {formatAuthorName(author)}
                    </Text>
                    {role && <Text>{role}</Text>}

                    <AuthorContacts {...author} />
                    {affiliation?.name && (
                      <>
                        ,&nbsp;
                        {affiliation.sameAs ? (
                          <Link href={affiliation.sameAs} isExternal ml={1}>
                            {affiliation.name}
                          </Link>
                        ) : (
                          <Text>{affiliation.name}</Text>
                        )}
                      </>
                    )}
                    {!showAsList && (isLast ? '.' : ',')}
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
