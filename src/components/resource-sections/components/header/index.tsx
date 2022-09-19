import React from 'react';
import { Box, Flex, Heading, Skeleton } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import ResourceAuthors from './components/authors';
import {
  BadgeWithTooltip,
  badgesConfig,
  getBadgeIcon,
} from 'src/components/badge-with-tooltip';
import { FaDollarSign } from 'react-icons/fa';
import { DisplayHTMLString } from 'src/components/html-content';

interface HeaderProps {
  isLoading: boolean;
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  isAccessibleForFree?: FormattedResource['isAccessibleForFree'];
  author?: FormattedResource['author'];
  name?: FormattedResource['name'];
  alternateName?: FormattedResource['alternateName'];
}

const Header: React.FC<HeaderProps> = ({
  isLoading,
  conditionsOfAccess,
  author,
  name,
  alternateName,
  isAccessibleForFree,
}) => {
  return (
    <Flex flexDirection='column' w='100%'>
      <Skeleton isLoaded={!isLoading} w='100%' p={2}>
        {/* Level of access to resource from open to restricted*/}
        {(conditionsOfAccess || isAccessibleForFree) && (
          <Flex w='100%' justifyContent='flex-end'>
            {isAccessibleForFree !== null &&
              typeof isAccessibleForFree !== 'undefined' && (
                <BadgeWithTooltip
                  mx={1}
                  icon={FaDollarSign}
                  {...badgesConfig['isAccessibleForFree'][
                    `${isAccessibleForFree}`
                  ]}
                >
                  {isAccessibleForFree ? 'Free Access' : 'Paid Access'}
                </BadgeWithTooltip>
              )}

            {conditionsOfAccess && (
              <BadgeWithTooltip
                icon={getBadgeIcon({
                  conditionsOfAccess,
                })}
                {...badgesConfig['conditionsOfAccess'][conditionsOfAccess]}
              >
                {conditionsOfAccess}
              </BadgeWithTooltip>
            )}
          </Flex>
        )}
      </Skeleton>
      <Flex>
        <Skeleton isLoaded={!isLoading} w='100%'>
          <Box m={[4, 6]}>
            {/* Title of resource */}
            <Heading as='h1' size='lg' fontFamily='body' wordBreak='break-word'>
              <DisplayHTMLString>{name}</DisplayHTMLString>
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
