import React from 'react';
import {Box, Flex, Heading, Skeleton, Text} from 'nde-design-system';
import {FormattedResource} from 'src/utils/api/types';
import ResourceAuthors from './components/authors';
import AccessBadge from '../access-badge';

interface HeaderProps {
  isLoading: boolean;
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  author?: FormattedResource['author'];
  citation?: FormattedResource['citation'];
  name?: FormattedResource['name'];
}

const Header: React.FC<HeaderProps> = ({
  isLoading,
  conditionsOfAccess,
  author,
  citation,
  name,
}) => {
  return (
    <Flex flexDirection='column' w='100%'>
      <Skeleton isLoaded={!isLoading} w='100%' p={2}>
        {/* Level of access to resource from open to restricted*/}
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
          {/* Title of resource */}
          <Heading
            as='h1'
            size='lg'
            fontFamily='body'
            wordBreak='break-word'
            m={[4, 6]}
          >
            {name}
          </Heading>
          {/* Authors of resource */}
          {author && <ResourceAuthors authors={author} />}
          {/* Name of journal */}
          <Box mx={[4, 6]}>
            {citation?.map(c => {
              if (!c.journalName) {
                return <></>;
              }
              return (
                <Text
                  key={c.id}
                  fontWeight='light'
                  fontStyle='italic'
                  color='gray.900'
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
