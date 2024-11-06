import React from 'react';
import { Flex, FlexProps, Icon, Text } from '@chakra-ui/react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { TagWithUrl } from 'src/components/tag-with-url';
import Tooltip from 'src/components/tooltip';
import { FaInfo } from 'react-icons/fa6';

interface ApplicationCategoryProps extends FlexProps {
  data: string[];
}

const ApplicationCategories: React.FC<ApplicationCategoryProps> = ({
  data,
  ...props
}) => {
  const cleanedAndSortedCategories = (data ?? [])
    .filter(element => element != null)
    .sort();

  if (cleanedAndSortedCategories.length === 0) return null;
  return (
    <Flex
      flexWrap='wrap'
      my={0}
      py={1}
      borderBottom='1px solid'
      borderBottomColor='gray.200'
      {...props}
    >
      <Tooltip>
        <Text fontSize='xs' color='gray.800' mr={1} userSelect='none'>
          Application Categories
          <Icon
            as={FaInfo}
            boxSize={3.5}
            border='1px solid'
            borderRadius='full'
            p={0.5}
            mx={1}
            color='gray.800!important'
          />
          :
        </Text>
      </Tooltip>

      {cleanedAndSortedCategories?.map(element => {
        return (
          <TagWithUrl
            key={element}
            colorScheme='primary'
            href={{
              pathname: '/search',
              query: {
                q: `applicationCategory:"${element.trim()}"`,
              },
            }}
            m={0.5}
            leftIcon={FaMagnifyingGlass}
          >
            {element}
          </TagWithUrl>
        );
      })}
    </Flex>
  );
};

export default ApplicationCategories;
