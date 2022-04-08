import React from 'react';
import {Flex, FlexProps, Icon, Text} from 'nde-design-system';
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
    <Flex flexWrap='wrap' {...props}>
      <Flex
        bg='status.info_lt'
        pl={pl}
        py={0}
        overflow='hidden'
        w={['100%', 'unset']}
      >
        {type && (
          <StyledLabel
            _before={{
              bg:
                type.toLowerCase() === 'dataset'
                  ? 'status.info'
                  : 'secondary.500',
            }}
          >
            <Text
              fontSize='xs'
              color='white'
              px={2}
              fontWeight='semibold'
              bg={
                type.toLowerCase() === 'dataset'
                  ? 'status.info'
                  : 'secondary.500'
              }
            >
              {type.toUpperCase()}
            </Text>
          </StyledLabel>
        )}
      </Flex>
      <Flex
        bg='status.info_lt'
        py={1}
        overflow='hidden'
        w={['100%', 'unset']}
        flex={['unset', 1]}
        px={4}
      >
        {datePublished && (
          <Flex alignItems='center'>
            <Icon as={FaRegClock} mr={2}></Icon>
            <Text fontSize='xs' fontWeight='semibold'>
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
