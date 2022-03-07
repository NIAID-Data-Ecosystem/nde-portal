import React from 'react';
import {Flex, Heading} from 'nde-design-system';

// Search result page header
interface ResourceHeaderProps {
  name?: string;
}
const ResourceHeader: React.FC<ResourceHeaderProps> = ({name}) => {
  if (!name) {
    return <></>;
  }

  return (
    <Flex>
      <Heading
        size={'md'}
        fontFamily={'body'}
        my={4}
        p={2}
        wordBreak={'break-word'}
      >
        {name}
      </Heading>
    </Flex>
  );
};

export default ResourceHeader;
