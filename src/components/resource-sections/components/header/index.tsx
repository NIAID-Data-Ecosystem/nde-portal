import React from 'react';
import { Box, Flex, Heading, Skeleton } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import ResourceAuthors from './components/authors';
import { DisplayHTMLString } from 'src/components/html-content';

interface HeaderProps {
  isLoading: boolean;
  author?: FormattedResource['author'];
  name?: FormattedResource['name'];
  alternateName?: FormattedResource['alternateName'];
}

const Header: React.FC<HeaderProps> = ({
  isLoading,
  author,
  name,
  alternateName,
}) => {
  return (
    <Flex flexDirection='column' w='100%'>
      <Flex>
        <Skeleton isLoaded={!isLoading} w='100%'>
          <Box m={[4, 6]}>
            {/* Title of resource */}
            <Heading as='h1' size='lg' fontFamily='body' wordBreak='break-word'>
              <DisplayHTMLString>{name || alternateName}</DisplayHTMLString>
            </Heading>
            {/* Alternate name of resource if it exists */}
            {!!name && alternateName && (
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
