import React from 'react';
import { Flex, FlexProps, Icon, Text } from 'nde-design-system';
import { FaRegClock } from 'react-icons/fa';
import { FormattedResource } from 'src/utils/api/types';
import { StyledLabel } from './styles';

interface TypeBannerProps extends FlexProps {
  type?: FormattedResource['type'];
  date?: FormattedResource['date'];
}

export const getTypeColor = (type: FormattedResource['type']) => {
  if (!type) {
    return;
  } else if (type.toLowerCase() === 'dataset') {
    return 'status.info';
  } else if (type.toLowerCase().includes('tool')) {
    return 'primary.800';
  }
  return 'niaid.color';
};

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
              bg: getTypeColor(type),
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
