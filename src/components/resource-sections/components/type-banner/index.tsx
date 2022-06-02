import React from 'react';
import { Flex, FlexProps, Icon, Text } from 'nde-design-system';
import { FaRegClock } from 'react-icons/fa';
import { FormattedResource } from 'src/utils/api/types';
import { StyledLabel } from './styles';

interface TypeBannerProps extends FlexProps {
  type?: FormattedResource['type'];
  date?: FormattedResource['date'];
}

const TypeBanner: React.FC<TypeBannerProps> = ({
  type,
  date,
  children,
  pl,
  ...props
}) => {
  return (
    <Flex flexWrap='wrap' w='100%' bg={props.bg || 'status.info_lt'} {...props}>
      <Flex
        bg={props.bg || 'status.info_lt'}
        pl={pl}
        py={0}
        overflow='hidden'
        minW={'150px'}
      >
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
            >
              {type.toUpperCase()}
            </Text>
          </StyledLabel>
        )}
      </Flex>
      <Flex
        bg={props.bg || 'status.info_lt'}
        overflow='hidden'
        flex={1}
        minW='250px'
      >
        {date && (
          <Flex alignItems='center' px={{ base: 2, lg: 4 }} py={[2, 1]}>
            <Icon as={FaRegClock} mr={2}></Icon>
            <Text fontSize='xs' fontWeight='semibold' whiteSpace='nowrap'>
              {date}
            </Text>
          </Flex>
        )}
        {children}
      </Flex>
    </Flex>
  );
};

export default TypeBanner;
