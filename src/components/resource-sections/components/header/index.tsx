import React from 'react';
import { Box, Flex, Heading, Skeleton, Text } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import ResourceAuthors from './components/authors';
import AccessBadge from '../access-badge';
import { formatJournal } from 'src/utils/helpers';

interface HeaderProps {
  isLoading: boolean;
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  author?: FormattedResource['author'];
  citation?: FormattedResource['citation'];
  name?: FormattedResource['name'];
  alternateName?: FormattedResource['alternateName'];
}

const Header: React.FC<HeaderProps> = ({
  isLoading,
  conditionsOfAccess,
  author,
  citation,
  name,
  alternateName,
}) => {
  return (
    <Flex flexDirection='column' w='100%'>
      <Skeleton isLoaded={!isLoading} w='100%' p={2}>
        {/* Level of access to resource from open to restricted*/}
        {conditionsOfAccess && (
          <Flex w='100%' justifyContent='flex-end'>
            <AccessBadge conditionsOfAccess={conditionsOfAccess}>
              {conditionsOfAccess}
            </AccessBadge>
          </Flex>
        )}
      </Skeleton>
      <Flex>
        <Skeleton isLoaded={!isLoading} w='100%'>
          <Box m={[4, 6]}>
            {/* Title of resource */}
            <Heading as='h1' size='lg' fontFamily='body' wordBreak='break-word'>
              {name}
            </Heading>
            {/* Alternate name of resource if it exists */}
            {alternateName && (
              <Heading
                as='h2'
                size='sm'
                fontFamily='body'
                color='text.body'
                fontWeight='semibold'
                wordBreak='break-word'
                mt={2}
              >
                <i>Alternate name: </i>
                {alternateName}
              </Heading>
            )}
          </Box>
          {/* Authors of resource */}
          {author && <ResourceAuthors authors={author} />}
        </Skeleton>
      </Flex>
    </Flex>
  );
};

export default Header;
