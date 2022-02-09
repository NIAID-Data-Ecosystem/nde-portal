import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  Badge,
  Box,
  Button,
  Flex,
  Divider,
  Heading,
  Icon,
  Image,
  Link,
  Text,
  useBreakpointValue,
  useDisclosure,
} from 'nde-design-system';
import {StyledTitle} from './styles';
import {FaLockOpen, FaLock, FaExternalLinkAlt} from 'react-icons/fa';

/**
 * [TO DO]
 * * [ ] Responsive badge with hover over icon
 * * [ ] Drawer for lengthy author names
 */

/**
 * Card Title
 */
interface SearchResultCardTitleProps {
  title: string;
  url?: string;
}

const Title: React.FC<SearchResultCardTitleProps> = ({title, url}) => {
  return (
    <StyledTitle>
      {url ? (
        <Link size='sm' href={url}>
          {title}
        </Link>
      ) : (
        <Heading fontWeight='extrabold' size='sm'>
          {title}
        </Heading>
      )}
    </StyledTitle>
  );
};

/**
 * Card Author
 */
interface AuthorProps {
  name: string;
  affiliation: {name: string};
  orcid?: string;
}

interface SearchResultCardAuthorProps {
  authorDetails: AuthorProps[];
}

const Author: React.FC<SearchResultCardAuthorProps> = ({authorDetails}) => {
  return (
    <Flex flex={1} flexWrap={'wrap'}>
      {authorDetails &&
        authorDetails.map((author, i) => (
          <Text
            key={i}
            size={'xs'}
            mr={2}
            whiteSpace={'nowrap'}
            color={'text.body'}
          >
            {author.name}
            {i < authorDetails.length - 1 ? ',' : ''}
          </Text>
        ))}
    </Flex>
  );
};

/**
 * Data Access
 */
// [NOTE]: Restrictions for accessing the data to be determined by API.
type RestrictedTypes = 'restricted' | 'some restrictions' | 'unrestricted';

interface SearchResultCardBadgeProps {
  accessType?: RestrictedTypes;
}

const AccessBadge: React.FC<SearchResultCardBadgeProps> = ({accessType}) => {
  if (!accessType) {
    return <></>;
  }
  return (
    <>
      {accessType === 'restricted' ? (
        <Badge colorScheme='red' p={2}>
          <Flex justifyContent='center' alignItems='center'>
            <Icon as={FaLock} boxSize={4} h='100%' mr={2} />
            {accessType}
          </Flex>
        </Badge>
      ) : (
        <Badge
          colorScheme={accessType === 'unrestricted' ? 'green' : 'yellow'}
          p={2}
        >
          <Flex justifyContent='center' alignItems='center'>
            <Icon as={FaLockOpen} boxSize={4} h='100%' mr={2} />
            {accessType}
          </Flex>
        </Badge>
      )}
    </>
  );
};

/**
 * Description
 */

interface SearchResultCardDescription {
  description: string;
}

const Description: React.FC<SearchResultCardDescription> = ({description}) => {
  const {isOpen, onToggle} = useDisclosure();
  // Words in a short description view.
  const MIN_WORDS = useBreakpointValue({base: 30, md: 50});

  // Maximum num of words in a long description view
  const MAX_WORDS = 75;

  const isDescriptionTooLong = description.split(' ').length > MAX_WORDS;

  return (
    <Flex flexDirection={'column'}>
      <Box
        dangerouslySetInnerHTML={{
          __html:
            description
              .split(' ')
              .splice(0, isOpen ? description.length : MIN_WORDS)
              .join(' ') + (isDescriptionTooLong && !isOpen ? ' ... ' : ''),
        }}
      ></Box>
      {isDescriptionTooLong && (
        <Box>
          <Button
            variant={'outline'}
            my={2}
            onClick={onToggle}
            colorScheme={'primary'}
          >
            {isOpen ? 'Show Less' : 'Show More'}
          </Button>
        </Box>
      )}
    </Flex>
  );
};

/**
 * External Links for data source.
 */
interface SourceProps {
  id: string;
  imageUrl?: string;
  name: string;
  url: string;
}
interface SearchResultCardExternalLinks {
  sourceDetails: SourceProps;
}

const ExternalLinks: React.FC<SearchResultCardExternalLinks> = ({
  sourceDetails,
}) => {
  return (
    <Flex
      flexDirection={'column'}
      bg='niaid.100'
      flexWrap={'wrap'}
      alignItems={['center', 'center', 'flex-start']}
    >
      <Button
        as='a'
        colorScheme={'primary'}
        flexDirection={'column'}
        w='100%'
        display={'flex'}
        alignItems={'center'}
        whiteSpace={['normal', 'normal', 'nowrap']}
      >
        <Text py={2} color={'inherit'}>
          Open in the workspace
          <Icon as={FaExternalLinkAlt} boxSize={3} ml={2} />
        </Text>
      </Button>
      <Button
        as='a'
        h={'unset'}
        colorScheme={'gray'}
        flexDirection={'column'}
        w='100%'
        display={'flex'}
        alignItems={'center'}
        whiteSpace={['normal', 'normal', 'nowrap']}
      >
        {sourceDetails.imageUrl && (
          <Image
            w={['50%', '50%', '100%']}
            src={sourceDetails.imageUrl}
            alt={'link to dataset on the repo'}
            whiteSpace={'normal'}
          ></Image>
        )}
        <Text py={2}>
          Open in {sourceDetails.name}
          <Icon as={FaExternalLinkAlt} boxSize={3} ml={2} />
        </Text>
      </Button>
    </Flex>
  );
};
/**
 * Search Result List Card item
 */

interface SearchResultCardProps
  extends SearchResultCardTitleProps,
    SearchResultCardAuthorProps,
    SearchResultCardDescription,
    SearchResultCardExternalLinks {
  accessType?: RestrictedTypes | null;
  keywords: string[];
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  title,
  url,
  authorDetails,
  accessType,
  description,
  keywords,
  sourceDetails,
}) => {
  return (
    <Card w={'100%'} my={4}>
      <CardHeader>
        <CardTitle>{title && <Title title={title} url={url} />}</CardTitle>
      </CardHeader>
      <Flex w={'100%'} alignItems={['flex-start', 'center']} py={0} pr={0}>
        <Author authorDetails={authorDetails} />
        {accessType && <AccessBadge accessType={accessType} />}
      </Flex>
      <Divider py={0} />
      <Flex flexDirection={['column', 'column', 'row']} p={0}>
        <Flex flexDirection={'column'} padding={[2, 4, 6]}>
          {description && <Description description={description} />}
          <Flex flexWrap={'wrap'}>
            {keywords &&
              keywords.map(keyword => {
                return <div key={keyword}>{keyword}</div>;
              })}
          </Flex>
        </Flex>
        {sourceDetails && <ExternalLinks sourceDetails={sourceDetails} />}
      </Flex>
    </Card>
  );
};
