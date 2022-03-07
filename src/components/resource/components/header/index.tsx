import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Flex,
  Heading,
  Icon,
  Link,
  Skeleton,
  Text,
} from 'nde-design-system';
import {FormattedResource, Creator} from 'src/utils/api/types';
import {StyledBadge} from './styles';
import {FaClock, FaLockOpen, FaLock} from 'react-icons/fa';

// Badge showing the access rights for the dataset
const AccessBadge: React.FC<{
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
}> = ({conditionsOfAccess}) => {
  const getBadgeColor = (
    accessType?: FormattedResource['conditionsOfAccess'],
  ) => {
    let props;
    switch (accessType) {
      case 'public':
        props = {color: 'status.success'};
        break;
      case 'controlled':
        props = {color: 'status.error'};
        break;
      case 'restricted':
        props = {color: 'status.error'};
        break;
      default:
        props = {color: 'status.info'};
    }
    return props;
  };

  return (
    <Flex flex={1} justifyContent='end'>
      <StyledBadge
        border='2px solid'
        boxShadow='none'
        {...getBadgeColor(conditionsOfAccess)}
      >
        {conditionsOfAccess === 'public' ? (
          <Icon as={FaLockOpen} h='100%' mr={2} />
        ) : (
          <Icon as={FaLock} boxSize={4} h='100%' mr={2} />
        )}
        {conditionsOfAccess}
      </StyledBadge>
    </Flex>
  );
};

// An accordion containing author details such as name and affiliation + link to their profile pages if available.
const ResourceAuthors = ({authors}: {authors: FormattedResource['author']}) => {
  if (!authors) {
    return null;
  }
  const formatAuthorNames = (
    author: Creator,
    withAffiliation: boolean = false,
  ) => {
    if (!author || !author.name) {
      return;
    }
    if (withAffiliation) {
      return (
        <Text key={author.name}>
          <strong>{author.name}</strong>
          {author?.affiliation?.name &&
            `${
              author.name.charAt(author.name.length - 1) === ';' ? ' ' : '; '
            } ${author.affiliation.name}`}
        </Text>
      );
    }
    return author.name + `${authors.length > 1 ? '; ' : ''}`;
  };

  return (
    <Accordion allowToggle borderColor='gray.100' my={2}>
      <AccordionItem>
        {({isExpanded}) => (
          <>
            <AccordionButton px={1}>
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
                    {authors.map(author => {
                      return formatAuthorNames(author);
                    })}
                  </Heading>
                </Box>
                <Flex alignItems='end'>
                  <Flex alignItems='center'>
                    <Text
                      fontSize='xs'
                      fontWeight='light'
                      minW={['unset', 'unset', 150]}
                    >
                      {isExpanded
                        ? 'hide author details'
                        : 'show author details'}
                    </Text>
                    <AccordionIcon />
                  </Flex>
                </Flex>
              </Flex>
            </AccordionButton>
            <AccordionPanel p={4} bg='page.alt'>
              {authors.map(author => {
                return (
                  <Box key={author.name}>
                    {author.id ? (
                      // link to orcid if available.
                      <Link href={author.id} isExternal target='_blank'>
                        {formatAuthorNames(author, true)}
                      </Link>
                    ) : (
                      <>{formatAuthorNames(author, true)}</>
                    )}
                  </Box>
                );
              })}
            </AccordionPanel>
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
};

interface HeaderProps {
  isLoading: boolean;
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  author?: FormattedResource['author'];
  datePublished?: FormattedResource['datePublished'];
  name?: FormattedResource['name'];
}

const Header: React.FC<HeaderProps> = ({
  isLoading,
  conditionsOfAccess,
  author,
  datePublished,
  name,
}) => {
  return (
    <Flex px={4} pb={4} flexDirection='column' w='100%'>
      <Skeleton isLoaded={!isLoading} w='100%'>
        {conditionsOfAccess && (
          <Flex w='100%'>
            <AccessBadge conditionsOfAccess={conditionsOfAccess} />
          </Flex>
        )}
      </Skeleton>
      <Flex py={4}>
        <Skeleton isLoaded={!isLoading} w='100%'>
          <Heading as='h1' size='lg' fontFamily='body' wordBreak='break-word'>
            {name}
          </Heading>
          {author && <ResourceAuthors authors={author}></ResourceAuthors>}
          {datePublished && (
            <Heading
              fontWeight='semibold'
              fontFamily='body'
              size='xs'
              display='flex'
              alignItems='center'
            >
              <Icon mr={2} as={FaClock}></Icon>
              Published on{' '}
              {datePublished instanceof Date
                ? new Date(datePublished).toLocaleDateString()
                : datePublished}
            </Heading>
          )}
        </Skeleton>
      </Flex>
    </Flex>
  );
};

export default Header;
