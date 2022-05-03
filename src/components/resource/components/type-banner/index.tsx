import React from 'react';
import {Box, Flex, FlexProps, Icon, Text} from 'nde-design-system';
import {formatDate} from 'src/utils/helpers';
import {FaRegClock} from 'react-icons/fa';
import {FormattedResource} from 'src/utils/api/types';
import {StyledLabel} from './styles';

interface TypeBannerProps extends FlexProps {
  type?: FormattedResource['type'];
  datePublished?: FormattedResource['datePublished'];
}

const TypeBanner: React.FC<TypeBannerProps> = ({
  type,
  datePublished,
  children,
  pl,
  ...props
}) => {
  return (
    <Flex flexWrap='wrap' w='100%' {...props} bg='status.info_lt'>
      <Flex bg='status.info_lt' pl={pl} py={0} overflow='hidden'>
        {type && (
          <StyledLabel
            _before={{
              bg:
                type.toLowerCase() === 'dataset'
                  ? 'status.info'
                  : type.toLowerCase().includes('tool')
                  ? 'primary.800'
                  : 'niaid.color',
            }}
          >
            <Text
              fontSize='xs'
              color='white'
              px={2}
              fontWeight='semibold'
              whiteSpace='nowrap'
              bg={
                type.toLowerCase() === 'dataset'
                  ? 'status.info'
                  : type.toLowerCase().includes('tool')
                  ? 'primary.800'
                  : 'niaid.color'
              }
            >
              {type.toUpperCase()}
            </Text>
          </StyledLabel>
        )}
      </Flex>
      <Flex bg='status.info_lt' overflow='hidden' flex={1} minW='250px'>
        {datePublished && (
          <Flex alignItems='center' px={{base: 2, lg: 4}} py={[2, 1]}>
            <Icon as={FaRegClock} mr={2}></Icon>
            <Text fontSize='xs' fontWeight='semibold' whiteSpace='nowrap'>
              Published on {formatDate(datePublished)}
            </Text>
          </Flex>
        )}
        {children}
      </Flex>
    </Flex>
  );
};

export default TypeBanner;
