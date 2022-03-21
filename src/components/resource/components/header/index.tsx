import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Box,
  Flex,
  Heading,
  Icon,
  Link,
  Skeleton,
  Text,
  Tag,
} from 'nde-design-system';
import {FormattedResource, Creator} from 'src/utils/api/types';
import {StyledBadge} from './styles';
import {FaClock, FaLockOpen, FaLock} from 'react-icons/fa';
import {formatAuthorsList2String} from 'src/utils/helpers';

/**
 * Access Badge
 */
interface AccessBadgeProps {
  conditionsOfAccess?: 'restricted' | 'public' | 'controlled';
  children: React.ReactNode;
}

export const AccessBadge = (args: AccessBadgeProps) => {
  let colorScheme;
  let iconType;

  if (args.conditionsOfAccess === 'public') {
    colorScheme = 'success';
    iconType = FaLockOpen;
  }

  if (args.conditionsOfAccess === 'restricted') {
    colorScheme = 'negative';
    iconType = FaLock;
  }

  if (args.conditionsOfAccess === 'controlled') {
    colorScheme = 'warning';
    iconType = FaLock;
  }

  return (
    <Badge colorScheme={colorScheme} {...args}>
      {iconType && <Icon mr={2} as={iconType} />}
      {typeof args.children === 'string' &&
        args.children.charAt(0).toUpperCase() + args.children.slice(1)}
    </Badge>
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
            <AccordionButton px={[4, 6]}>
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
                    {formatAuthorsList2String(authors)}
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
            <AccordionPanel px={[1, 4, 6]} py={4} bg='page.alt'>
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
  citation?: FormattedResource['citation'];
  name?: FormattedResource['name'];
}

const Header: React.FC<HeaderProps> = ({
  isLoading,
  conditionsOfAccess,
  author,
  citation,
  datePublished,
  name,
}) => {
  return (
    <Flex flexDirection='column' w='100%'>
      <Skeleton isLoaded={!isLoading} w='100%'>
        {conditionsOfAccess && (
          <Flex w='100%' justifyContent='end'>
            <AccessBadge conditionsOfAccess={conditionsOfAccess}>
              {conditionsOfAccess}
            </AccessBadge>
          </Flex>
        )}
      </Skeleton>
      <Flex>
        <Skeleton isLoaded={!isLoading} w='100%'>
          <Heading
            as='h1'
            size='lg'
            fontFamily='body'
            wordBreak='break-word'
            m={[4, 6]}
          >
            {name}
          </Heading>
          {author && <ResourceAuthors authors={author}></ResourceAuthors>}
          <Box mx={[4, 6]}>
            {citation?.map(c => {
              if (!c.journalName) {
                return <></>;
              }
              return (
                <Text
                  key={c.id}
                  fontWeight={'light'}
                  fontStyle='italic'
                  color={'gray.900'}
                  my={2}
                >
                  {c.journalName}
                </Text>
              );
            })}
          </Box>
        </Skeleton>
      </Flex>
    </Flex>
  );
};

export default Header;
